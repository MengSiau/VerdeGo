import { apiFetch } from './client';
import type { RidePassenger, RideWithDetails } from './rides';

export interface RequestPassengerSummary {
    user_id: string;
    name: string;
    rating: number;
    rating_count: number;
}

export interface PendingRequest extends RideWithDetails {
    ride_passenger_id: string;
    requested_at: string;
    passenger: RequestPassengerSummary;
}

// Every pending ('requested') booking across every ride the current user drives.
export function getPendingRequests(): Promise<PendingRequest[]> {
    return apiFetch<PendingRequest[]>('/api/rides/requests');
}

// Only the ride's driver can call these - the backend 403s otherwise.
export function acceptRequest(ridePassengerId: string): Promise<RidePassenger> {
    return apiFetch<RidePassenger>(`/api/rides/requests/${ridePassengerId}/accept`, {
        method: 'PATCH',
    });
}

export function declineRequest(ridePassengerId: string): Promise<RidePassenger> {
    return apiFetch<RidePassenger>(`/api/rides/requests/${ridePassengerId}/decline`, {
        method: 'PATCH',
    });
}
