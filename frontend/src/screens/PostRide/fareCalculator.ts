import type { FuelType } from './PostRideContext';

// Fallback distance for when routing is unavailable. Matches Priya's dummy
// ride so demo figures stay consistent across the app.
export const DEMO_DISTANCE_KM = 18.4;
export const RACV_PETROL_PRICE_PER_L = 1.89;
export const PLATFORM_FEE = 0.5;
export const FUEL_CONSUMPTION_L_PER_100KM: Record<FuelType, number> = {
  petrol: 7.5,
  diesel: 6.0,
  hybrid: 5.2,
  electric: 0,
};

export function calculateFuelCost(fuelType: FuelType, distanceKm = DEMO_DISTANCE_KM) {
  return (distanceKm / 100) * FUEL_CONSUMPTION_L_PER_100KM[fuelType] * RACV_PETROL_PRICE_PER_L;
}

export function calculateBaseFarePerPassenger(fuelType: FuelType, distanceKm = DEMO_DISTANCE_KM) {
  return calculateFuelCost(fuelType, distanceKm) + PLATFORM_FEE;
}

export function calculateFinalFarePerPassenger(
  fuelType: FuelType,
  adjustmentPercent: number,
  distanceKm = DEMO_DISTANCE_KM,
) {
  return calculateBaseFarePerPassenger(fuelType, distanceKm) * (1 + adjustmentPercent / 100);
}
