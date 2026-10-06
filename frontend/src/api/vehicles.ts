import { apiFetch } from './client';

export interface VehicleModel {
    model_id: string;
    make: string;
    model: string;
    year: number;
    co2_g_per_km: number;
}

export interface Vehicle {
    vehicle_id: string;
    user_id: string;
    model_id: string;
    license_plate: string;
    created_at: string;
}

// GET includes model details but does not select user_id.
export interface VehicleWithDetails extends Omit<Vehicle, 'user_id'> {
    vehicle_models: Omit<VehicleModel, 'model_id'> | null;
}

export interface VehicleRequest {
    model_id: string;
    license_plate: string;
}

export function getVehicles(): Promise<VehicleWithDetails[]> {
    return apiFetch<VehicleWithDetails[]>('/api/vehicles');
}

export function getVehicleModels(): Promise<VehicleModel[]> {
    return apiFetch<VehicleModel[]>('/api/vehicles/models');
}

export function addVehicle(data: VehicleRequest): Promise<Vehicle> {
    return apiFetch<Vehicle>('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateVehicle(
    vehicleId: string,
    data: VehicleRequest
): Promise<Vehicle> {
    return apiFetch<Vehicle>(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function deleteVehicle(vehicleId: string): Promise<void> {
    return apiFetch<void>(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
    });
}