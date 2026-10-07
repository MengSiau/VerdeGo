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

export interface CreateRideRequest {
    vehicle_id: string;
    origin_lat: number;
    origin_lng: number;
    destination_lat: number;
    destination_lng: number;
    departure_time: string;
    price_per_passenger: number;
    seats_available: number;
}

export function getRides(): Promise<RideWithDetails[]> {
    return apiFetch<RideWithDetails[]>('/api/rides');
}

export function getRide(rideId: string): Promise<RideWithDetails> {
    return apiFetch<RideWithDetails>(`/api/rides/${rideId}`);
}

export function createRide(data: CreateRideRequest): Promise<Ride> {
    return apiFetch<Ride>('/api/rides', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}