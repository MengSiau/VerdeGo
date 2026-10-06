/** Total trip emissions in kg, using the saved vehicle model factor in g/km. */
export function calculateRideEmissionsKg(gPerKm: number | null | undefined, distanceKm: number | undefined): number | undefined {
  if (gPerKm == null || distanceKm == null || !Number.isFinite(gPerKm) ||
      !Number.isFinite(distanceKm) || gPerKm < 0 || distanceKm <= 0) return undefined;
  const total = gPerKm * distanceKm / 1000;
  return Number.isFinite(total) ? total : undefined;
}
