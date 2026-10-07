import type { RideWithDetails } from '@/src/api/rides';

import type { Ride } from './rides';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function addMinutes(iso: string, minutes: number) {
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

// Maps one backend ride (snake_case, lat/lng, nested driver/estimate) onto the local Ride
// shape the UI (RideCard, RideOverview, ...) already knows how to render.
//
// Known gaps, until the backend has more to give us:
// - No place names yet, only coordinates - pickup is a rounded lat/lng placeholder until
//   reverse geocoding exists. Destination is always Monash Clayton, which is already a
//   fixed product fact, not a guess.
// - No real "CO2 saved vs driving alone" comparison from the backend (it only returns the
//   trip's own estimate) - showing it as the saved figure is a known approximation, not a
//   fabricated number, until that comparison is computed server-side.
// - `seats` here is actually "seats still available" (that's all the backend returns),
//   not the vehicle's total seat count.
// - distance/duration/CO2 fall back to 0 when the ride has no route_estimates row yet
//   (e.g. posted before that part of create_ride is wired up) - a placeholder, not a claim.
export function mapRideWithDetailsToRide(item: RideWithDetails): Ride {
  const { ride, driver, estimate } = item;
  const durationMinutes = Math.round(estimate.duration_min ?? 0);

  return {
    id: ride.ride_id,
    vehicleId: ride.vehicle_id,
    driverId: driver.user_id,
    driverName: driver.name,
    rating: driver.rating,
    ratingCount: driver.rating_count,
    pickup: `Pickup near (${ride.origin.lat.toFixed(3)}, ${ride.origin.lng.toFixed(3)})`,
    destination: 'Monash Clayton Campus',
    date: formatDate(ride.departure_time),
    departureTime: formatTime(ride.departure_time),
    dropoffTimeEstimate: formatTime(addMinutes(ride.departure_time, durationMinutes)),
    distanceKm: estimate.distance_km ?? 0,
    seats: ride.seats_available,
    durationMinutes,
    price: ride.price_per_passenger,
    co2SavedKg: estimate.co2_estimate_kg ?? 0,
    co2EstimateKg: estimate.co2_estimate_kg ?? 0,
    confirmedPassengers: [],
  };
}
