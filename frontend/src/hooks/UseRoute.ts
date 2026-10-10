import { useEffect, useState } from 'react';

import { decodePolyline } from './polyline';
import type { Coordinate } from './UseReverseGeocode';

export type RouteResult = {
  /** Points along the road, for drawing a Polyline. */
  path: Coordinate[];
  distanceKm: number;
  durationMinutes: number;
};

type RouteState = {
  route: RouteResult | null;
  loading: boolean;
  error: string | null;
};

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

// Cache by rounded coordinate pair. The same route gets requested from several
// screens (review, ride details, fullscreen) and there's no reason to pay for
// it more than once per session.
const cache = new Map<string, RouteResult>();

function cacheKey(origin: Coordinate, destination: Coordinate): string {
  const round = (n: number) => n.toFixed(4);
  return `${round(origin.latitude)},${round(origin.longitude)}->${round(
    destination.latitude,
  )},${round(destination.longitude)}`;
}

/**
 * Fetches a driving route between two points via Google's Routes API.
 *
 * Returns the road path for drawing, plus real distance and duration - which
 * replaces the hardcoded DEMO_DISTANCE_KM used by the fare and CO2 calcs.
 *
 * Covered by the Maps Demo Key, so no billing account is needed.
 */
export function useRoute(
  origin: Coordinate | null,
  destination: Coordinate | null,
): RouteState {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination) {
      setRoute(null);
      return;
    }

    const key = cacheKey(origin, destination);
    const cached = cache.get(key);
    if (cached) {
      setRoute(cached);
      setError(null);
      return;
    }

    if (!API_KEY) {
      setError('Routing is not configured');
      return;
    }

    setLoading(true);
    setError(null);
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(ROUTES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            // Required, and it controls cost - request only what you use.
            'X-Goog-FieldMask':
              'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
          },
          body: JSON.stringify({
            origin: { location: { latLng: origin } },
            destination: { location: { latLng: destination } },
            travelMode: 'DRIVE',
            // TRAFFIC_UNAWARE is the cheapest tier and fine for a posted ride
            // that may be days away. TRAFFIC_AWARE costs more and only helps
            // for departures in the next hour or so.
            routingPreference: 'TRAFFIC_UNAWARE',
            polylineQuality: 'OVERVIEW',
          }),
        });

        if (!response.ok) throw new Error(`Routes returned ${response.status}`);

        const data = await response.json();
        const first = data.routes?.[0];
        if (!first) throw new Error('No route found');

        const result: RouteResult = {
          path: decodePolyline(first.polyline?.encodedPolyline ?? ''),
          distanceKm: Math.round((first.distanceMeters / 1000) * 10) / 10,
          // Duration comes back as a string of seconds, e.g. "1080s".
          durationMinutes: Math.round(parseInt(first.duration, 10) / 60),
        };

        cache.set(key, result);
        if (!cancelled) setRoute(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load route');
          setRoute(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude]);

  return { route, loading, error };
}

