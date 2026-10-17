import type { RideWithDetails } from '@/src/api/rides';
import { reverseGeocode } from '@/src/utils/reverseGeocode';

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
// The backend only ever stores lat/lng (there's no place-name column), so pickup is
// reverse-geocoded back into a real name here, every time a ride is read - the same
// on-device geocoder PostLocation's live map pin uses, via the shared cache in
// src/utils/reverseGeocode.ts, so the same point isn't looked up over and over.
//
// Known gaps, until the backend has more to give us:
// - No real "CO2 saved vs driving alone" comparison from the backend (it only returns the
//   trip's own estimate) - showing it as the saved figure is a known approximation, not a
//   fabricated number, until that comparison is computed server-side.
// - `seats` here is actually "seats still available" (that's all the backend returns),
//   not the vehicle's total seat count.
// - distance/duration/CO2 fall back to 0 when the ride has no route_estimates row yet
//   (e.g. posted before that part of create_ride is wired up) - a placeholder, not a claim.
export async function mapRideWithDetailsToRide(item: RideWithDetails): Promise<Ride> {
  const { ride, driver, estimate } = item;
  const durationMinutes = Math.round(estimate.duration_min ?? 0);
  const pickup = await reverseGeocode(
    { latitude: ride.origin.lat, longitude: ride.origin.lng },
    `Pickup near (${ride.origin.lat.toFixed(3)}, ${ride.origin.lng.toFixed(3)})`,
  );

  return {
    id: ride.ride_id,
    vehicleId: ride.vehicle_id,
    driverId: driver.user_id,
    driverName: driver.name,
    rating: driver.rating,
    ratingCount: driver.rating_count,
    pickup,
    destination: 'Monash Clayton Campus',
    pickupLat: ride.origin.lat,
    pickupLng: ride.origin.lng,
    destinationLat: ride.destination.lat,
    destinationLng: ride.destination.lng,
    date: formatDate(ride.departure_time),
    departureTime: formatTime(ride.departure_time),
    dropoffTimeEstimate: formatTime(addMinutes(ride.departure_time, durationMinutes)),
    distanceKm: estimate.distance_km ?? 0,
    seats: ride.seats_available,
    durationMinutes,
    price: ride.price_per_passenger,
    co2SavedKg: estimate.co2_estimate_kg ?? 0,
    co2EstimateKg: estimate.co2_estimate_kg ?? 0,
    confirmedPassengers: ride.confirmed_passengers.map((p) => ({ name: p.name })),
  };
}
