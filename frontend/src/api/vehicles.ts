import { apiFetch } from './client';

export interface VehicleModel {
    model_id: string;
    make: string;
    model: string;
    year: number;
    co2_g_per_km: number | null;
}

export interface VehicleMake {
    make_id: string;
    name: string;
}

export interface VehicleEmissions {
    model_id: string;
    distance_km: number;
    co2_g_per_km: number;
    carbon_g: number;
    carbon_kg: number;
}

export function getVehicleMakes(): Promise<VehicleMake[]> {
    return apiFetch<VehicleMake[]>('/api/vehicles/makes');
}

export interface VehicleCatalogueModel extends Omit<VehicleModel, 'year'> {
    year: number | null;
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

export function getVehicleModels(make: string): Promise<VehicleCatalogueModel[]> {
    return apiFetch<VehicleCatalogueModel[]>(`/api/vehicles/models?make=${encodeURIComponent(make)}`);
}

export function getModelEmissions(modelId: string, year: number, make: string, model: string): Promise<VehicleModel> {
    return apiFetch<VehicleModel>(`/api/vehicles/models/${modelId}/emissions`, {
        method: 'POST', body: JSON.stringify({ year, make, model }),
    });
}

export function estimateVehicleEmissions(modelId: string, distanceKm: number): Promise<VehicleEmissions> {
    return apiFetch<VehicleEmissions>('/api/vehicles/emissions', {
        method: 'POST',
        body: JSON.stringify({ model_id: modelId, distance_km: distanceKm }),
    });
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
