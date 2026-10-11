import { apiFetch } from './client';

export interface Ride {
    ride_id: string;
    vehicle_id: string;
    ride_status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

    origin: {
        lat: number;
        lng: number;
    };

    destination: {
        lat: number;
        lng: number;
    };

    departure_time: string;
    price_per_passenger: number;
    seats_available: number;
    created_at: string;
    // Everyone whose booking on this ride is 'accepted' - not people who've only requested.
    confirmed_passengers: { user_id: string; name: string }[];
}

export interface DriverSummary {
    user_id: string;
    name: string;
    rating: number;
    rating_count: number;
}

export interface EstimatedRideDetails {
    // null when the ride has no route_estimates row yet (e.g. just created, before that's wired up).
    distance_km: number | null;
    duration_min: number | null;
    co2_estimate_kg: number | null;
}

export interface RideWithDetails {
    ride: Ride;
    driver: DriverSummary;
    estimate: EstimatedRideDetails;
}

export interface MyRideWithDetails extends RideWithDetails {
    role: 'driver' | 'passenger';
    // Only present when role is 'passenger'.
    passenger_status?: 'requested' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
}

export interface CreateRideRequest {
    vehicle_id: string;
    origin_lat: number;
    origin_lng: number;
    destination_lat: number;
    destination_lng: number;
    departure_time: string;
    price_per_passenger: number;
    seats_available: number;
    // Optional: if the client already has a real route estimate (e.g. from a routing
    // API), all three persist it as the ride's route_estimates row. A partial set is
    // ignored server-side, so don't send one or two without the rest.
    distance_km?: number;
    duration_min?: number;
    co2_estimate_kg?: number;
}

export function getRides(): Promise<RideWithDetails[]> {
    return apiFetch<RideWithDetails[]>('/api/rides');
}

export function getRide(rideId: string): Promise<RideWithDetails> {
    return apiFetch<RideWithDetails>(`/api/rides/${rideId}`);
}

export function getMyRides(): Promise<MyRideWithDetails[]> {
    return apiFetch<MyRideWithDetails[]>('/api/rides/mine');
}

export function createRide(data: CreateRideRequest): Promise<Ride> {
    return apiFetch<Ride>('/api/rides', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Only the ride's driver can call this - the backend 403s otherwise. Also cancels every
// live booking on the ride, so it drops off each passenger's My Rides too.
export function cancelRide(rideId: string): Promise<Ride> {
    return apiFetch<Ride>(`/api/rides/${rideId}/cancel`, {
        method: 'PATCH',
    });
}

export interface RidePassenger {
    ride_passenger_id: string;
    ride_id: string;
    passenger_id: string;
    ride_passenger_status: 'requested' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
    requested_at: string;
    responded_at: string | null;
}

// Creates (or re-opens, if previously rejected/cancelled) a 'requested' booking on this
// ride. Doesn't count toward the ride yet - that only happens once the driver accepts it.
export function requestToJoinRide(rideId: string): Promise<RidePassenger> {
    return apiFetch<RidePassenger>(`/api/rides/${rideId}/request`, {
        method: 'POST',
    });
}

// Passenger cancels their own booking on this ride - the counterpart to cancelRide(),
// which only works for the driver. Frees up the seat if the booking was accepted.
export function leaveRide(rideId: string): Promise<RidePassenger> {
    return apiFetch<RidePassenger>(`/api/rides/${rideId}/leave`, {
        method: 'PATCH',
    });
}