import type { RideWithDetails } from '@/src/api/rides';

import type { Ride } from './rides';

/**
 * Translates the backend's RideWithDetails into the view model the screens
 * render.
 *
 * Keeping the translation in one place means the API contract and the UI shape
 * can change independently - a field rename on the backend is one line here
 * rather than a hunt through every screen.
 */
export function toUiRide(item: RideWithDetails): Ride {
  const { ride, driver, estimate } = item;

  const departure = new Date(ride.departure_time);
  const durationMinutes = toNumber(estimate.duration_min) ?? 0;
  const dropoff = new Date(departure.getTime() + durationMinutes * 60_000);

  return {
    id: ride.ride_id,
    vehicleId: ride.vehicle_id,

    driverId: driver.user_id,
    driverName: driver.name,
    rating: driver.rating,
    ratingCount: driver.rating_count,

    // Labels are stored with the coordinates (see 003_ride_labels.sql). The
    // coordinate fallback only shows for rows predating that migration.
    pickup: ride.origin_label ?? formatCoordinate(ride.origin.lat, ride.origin.lng),
    destination:
      ride.destination_label ??
      formatCoordinate(ride.destination.lat, ride.destination.lng),

    date: formatDate(departure),
    departureTime: formatTime(departure),
    dropoffTimeEstimate: formatTime(dropoff),

    // Coordinates drive the map, so they get the same NUMERIC coercion as
    // everything else - MapView renders nothing for a string latitude.
    pickupLat: toNumber(ride.origin.lat) ?? 0,
    pickupLng: toNumber(ride.origin.lng) ?? 0,
    destinationLat: toNumber(ride.destination.lat) ?? 0,
    destinationLng: toNumber(ride.destination.lng) ?? 0,

    distanceKm: toNumber(estimate.distance_km) ?? 0,
    durationMinutes,
    seats: ride.seats_available,
    price: toNumber(ride.price_per_passenger) ?? 0,

    co2EstimateKg: toNumber(estimate.co2_estimate_kg) ?? 0,
    // Deprecated: the screens now compute this from passenger count via
    // calculateCo2SavedKg, since the saving depends on who actually joined.
    co2SavedKg: 0,

    // TODO: not returned by the feed endpoint. The details screen should fetch
    // these separately once GET /api/rides/<id>/passengers exists.
    confirmedPassengers: [],
  };
}

export function toUiRides(items: RideWithDetails[]): Ride[] {
  return items.map(toUiRide);
}

/**
 * Postgres NUMERIC columns arrive as strings over JSON, so a raw value may be
 * "18.40" rather than 18.4. Without this, `distanceKm.toFixed(1)` throws.
 */
function toNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** "Wed, 13 Aug 2025" - matches the format the review screen already uses. */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "8:15 AM" */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Last-resort label when no place name was stored. */
function formatCoordinate(lat: number, lng: number): string {
  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}