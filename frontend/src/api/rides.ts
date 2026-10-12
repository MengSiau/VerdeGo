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

    /** Readable place names stored alongside the coordinates. */
    origin_label: string | null;
    destination_label: string | null;

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
    origin_label?: string;
    destination_label?: string;
    /** ISO 8601 timestamp, e.g. new Date(...).toISOString() */
    departure_time: string;
    price_per_passenger: number;
    seats_available: number;
    /** Written to route_estimates. All three are required by the schema. */
    distance_km: number;
    duration_min: number;
    co2_estimate_kg: number;
}

/**
 * The browse feed: scheduled rides posted by other people.
 *
 * Pass { mine: true } for the rides the current user is driving. The endpoint
 * excludes your own rides from the default response, so the two calls together
 * cover everything.
 */
export function getRides(options: { mine?: boolean } = {}): Promise<RideWithDetails[]> {
    const path = options.mine ? '/api/rides?mine=true' : '/api/rides';
    return apiFetch<RideWithDetails[]>(path);
}

export function createRide(data: CreateRideRequest): Promise<Ride> {
    return apiFetch<Ride>('/api/rides', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}