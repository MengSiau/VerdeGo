import { apiFetch } from './client';

export interface Ride {
    ride_id: string;
    vehicle_id: string;
    ride_status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    origin_lat: number;
    origin_lng: number;
    destination_lat: number;
    destination_lng: number;
    departure_time: string;
    price_per_passenger: number;
    seats_available: number;
    created_at: string;
}

export interface RideWithDetails extends Ride {
    driver: DriverSummary;
    estimate: EstimatedRideDetails;
}

export interface DriverSummary {
    name: string;
    rating: number | null;
    rating_count: number;
}

export interface EstimatedRideDetails {
    distance_km: number;
    duration_min: number;
    co2_estimate_kg: number;
}

export interface RideWithPassengers extends RideWithDetails {
    confirmed_passengers: PassengerSummary[];
}

export interface PassengerSummary {
    user_id: string;
    name: string;
    pickup: string;
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

export function createRide(data: CreateRideRequest): Promise<Ride> {
    return apiFetch<Ride>('/api/rides', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}