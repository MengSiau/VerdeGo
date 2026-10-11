/**
 * Average emissions of an Australian passenger vehicle, in grams of CO2 per
 * kilometre. Used for the counterfactual - what a passenger would have emitted
 * had they driven themselves - rather than the driver's own vehicle factor,
 * since we can't know what car each passenger would otherwise have taken.
 *
 * ~170 g/km sits between the new-car average and the older on-road fleet.
 * Cite the source you settle on in the report; the figure is a stated
 * assumption, not a measurement.
 */
export const AVERAGE_CAR_G_PER_KM = 170;

/**
 * Emissions avoided, in kg, by passengers sharing this ride instead of each
 * driving themselves.
 *
 * Each passenger is assumed to have made the same journey alone in an average
 * car. The driver is excluded - they were making the trip regardless, so their
 * emissions are not a saving.
 */
export function calculateCo2SavedKg(
  distanceKm: number | null | undefined,
  passengerCount: number | null | undefined,
  gPerKm: number = AVERAGE_CAR_G_PER_KM,
): number {
  const distance = Number(distanceKm);
  const passengers = Number(passengerCount);

  if (!Number.isFinite(distance) || distance <= 0) return 0;
  if (!Number.isFinite(passengers) || passengers <= 0) return 0;

  return (gPerKm * distance * passengers) / 1000;
}