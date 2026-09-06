import type { FuelType } from './PostRideContext';

// No real distance/pricing API wired up yet - fixed demo values (distance matches Priya's
// dummy ride so figures stay consistent with the rest of the app's demo data).
// Shared between PostFare (breakdown) and PostConfirm (final summary) so both agree on one price.
export const DEMO_DISTANCE_KM = 18.4;
export const RACV_PETROL_PRICE_PER_L = 1.89;
export const PLATFORM_FEE = 0.5;
export const FUEL_CONSUMPTION_L_PER_100KM: Record<FuelType, number> = {
  petrol: 7.5,
  diesel: 6.0,
  hybrid: 5.2,
  electric: 0,
};

export function calculateFuelCost(fuelType: FuelType) {
  return (DEMO_DISTANCE_KM / 100) * FUEL_CONSUMPTION_L_PER_100KM[fuelType] * RACV_PETROL_PRICE_PER_L;
}

export function calculateBaseFarePerPassenger(fuelType: FuelType) {
  return calculateFuelCost(fuelType) + PLATFORM_FEE;
}

export function calculateFinalFarePerPassenger(fuelType: FuelType, adjustmentPercent: number) {
  return calculateBaseFarePerPassenger(fuelType) * (1 + adjustmentPercent / 100);
}
