import type { StyleProp, ViewStyle } from 'react-native';

import type { Ride } from '@/src/data/rides';
import { useRoute } from '@/src/hooks/UseRoute';

import { RouteMap } from './RouteMap';

type RideRouteMapProps = {
  ride: Ride;
  /** true allows pan and zoom. Leave off for a preview. */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * RouteMap for a saved ride, with the road path fetched on demand.
 *
 * A Ride carries its two endpoints but not the polyline between them, so a
 * plain RouteMap would fall back to the dashed straight line. This asks
 * useRoute for the real path; the hook caches by coordinate pair, so opening a
 * ride and then expanding it costs one request, not two.
 *
 * Longer term the polyline belongs on route_estimates, written once when the
 * ride is posted - then no screen needs to re-request it.
 */
export function RideRouteMap({ ride, interactive, style }: RideRouteMapProps) {
  // Coerced because Postgres NUMERIC arrives over JSON as a string, and
  // MapView silently renders nothing for a non-numeric coordinate.
  const origin = toCoordinate(ride.pickupLat, ride.pickupLng);
  const destination = toCoordinate(ride.destinationLat, ride.destinationLng);

  const { route } = useRoute(origin, destination);

  if (!origin || !destination) return null;

  return (
    <RouteMap
      origin={origin}
      destination={destination}
      path={route?.path}
      interactive={interactive}
      style={style}
    />
  );
}

function toCoordinate(
  lat: number | string | null | undefined,
  lng: number | string | null | undefined,
) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  // 0,0 is in the Gulf of Guinea - almost certainly a missing value rather
  // than a real pickup point.
  if (latitude === 0 && longitude === 0) return null;

  return { latitude, longitude };
}