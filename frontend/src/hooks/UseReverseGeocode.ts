
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

type ReverseGeocodeState = {
  /** Human-readable label for the coordinate, or a fallback. */
  label: string;
  /** True while a lookup is in flight. */
  loading: boolean;
};

// Wait for the user to stop panning before asking the geocoder. Both iOS and
// Android throttle geocoding requests, and firing one per frame will get you
// rate-limited within seconds.
const DEBOUNCE_MS = 600;

// Round to ~11 m before comparing, so tiny map drift doesn't trigger a lookup.
const PRECISION = 4;

function cacheKey(coordinate: Coordinate): string {
  return `${coordinate.latitude.toFixed(PRECISION)},${coordinate.longitude.toFixed(PRECISION)}`;
}

/**
 * Turns a map coordinate into a readable place name.
 *
 * Uses expo-location's reverseGeocodeAsync, which calls the device's own
 * geocoder (CLGeocoder on iOS, Geocoder on Android). Free, no API key, works
 * in Expo Go.
 *
 * Caveats worth knowing:
 *  - Android requires Google Play Services; results are empty on devices
 *    without it (most emulators without Play, some Huawei devices).
 *  - Both platforms rate-limit. The debounce and cache below keep usage low,
 *    but a failed lookup is normal and must degrade gracefully.
 *  - Quality varies. A pin in a car park may resolve to the street, not the
 *    building. That's acceptable for a meeting point.
 */
export function useReverseGeocode(coordinate: Coordinate): ReverseGeocodeState {
  const [label, setLabel] = useState('Locating…');
  const [loading, setLoading] = useState(false);

  // Coordinates we've already resolved, so panning back doesn't re-query.
  const cache = useRef(new Map<string, string>());

  useEffect(() => {
    const key = cacheKey(coordinate);

    const cached = cache.current.get(key);
    if (cached) {
      setLabel(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const results = await Location.reverseGeocodeAsync(coordinate);
        if (cancelled) return;

        const resolved = formatAddress(results[0]) ?? 'Dropped pin';
        cache.current.set(key, resolved);
        setLabel(resolved);
      } catch {
        // Rate-limited, offline, or no geocoder available. The coordinate is
        // still valid and still gets saved - only the label is missing.
        if (!cancelled) setLabel('Dropped pin');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [coordinate.latitude, coordinate.longitude]);

  return { label, loading };
}

/**
 * Builds a short label from a geocode result.
 *
 * Prefers a named place ("Glen Waverley Station") when the geocoder recognises
 * one, then falls back to street address, then suburb. Deliberately short -
 * this renders on one line in a card.
 */
function formatAddress(result: Location.LocationGeocodedAddress | undefined): string | null {
  if (!result) return null;

  // `name` is often the POI or the street number + street.
  const { name, street, streetNumber, city, district, subregion } = result;

  const locality = city ?? district ?? subregion ?? null;

  if (name && street && name !== street) {
    return locality ? `${name}, ${locality}` : name;
  }

  if (street) {
    const line = streetNumber ? `${streetNumber} ${street}` : street;
    return locality ? `${line}, ${locality}` : line;
  }

  return name ?? locality;
}
