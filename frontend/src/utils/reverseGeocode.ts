import * as Location from 'expo-location';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

// Shared across every screen that needs a name for a coordinate (ride cards, ride
// details, the live map pin in PostLocation) - one cache, not one per caller, since the
// same pickup point gets looked up repeatedly across different rides and screens.
const cache = new Map<string, string>();

// Round to ~11 m before comparing, so tiny coordinate drift doesn't trigger a lookup.
const PRECISION = 4;

export function reverseGeocodeCacheKey(coordinate: Coordinate): string {
  return `${coordinate.latitude.toFixed(PRECISION)},${coordinate.longitude.toFixed(PRECISION)}`;
}

/**
 * Builds a short label from a geocode result.
 *
 * Prefers a named place ("Glen Waverley Station") when the geocoder recognises
 * one, then falls back to street address, then suburb. Deliberately short -
 * this renders on one line in a card.
 */
export function formatAddress(result: Location.LocationGeocodedAddress | undefined): string | null {
  if (!result) return null;

  // `name` is often the POI or the street number + street.
  const { name, street, streetNumber, city, district, subregion } = result;

  const locality = city ?? district ?? subregion ?? null;

  if (name && street && name !== street) {
    return locality ? `${name}, ${locality}` : name;
  }

  if (street) {
    const line = streetNumber ? `${streetNumber} ${street}` : street;
    return locality ? `${line}, ${locality}` : line;
  }

  return name ?? locality;
}

/**
 * Turns a coordinate into a readable place name, via expo-location's
 * reverseGeocodeAsync (the device's own geocoder - CLGeocoder on iOS, Geocoder on
 * Android; free, no API key, works in Expo Go).
 *
 * Caveats worth knowing:
 *  - Android requires Google Play Services; results are empty on devices without it.
 *  - Both platforms rate-limit, which the cache above keeps usage low against - but a
 *    failed lookup is normal and must degrade gracefully to `fallback`.
 *  - Quality varies. A pin in a car park may resolve to the street, not the building.
 */
export async function reverseGeocode(coordinate: Coordinate, fallback = 'Dropped pin'): Promise<string> {
  const key = reverseGeocodeCacheKey(coordinate);
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const results = await Location.reverseGeocodeAsync(coordinate);
    const resolved = formatAddress(results[0]) ?? fallback;
    cache.set(key, resolved);
    return resolved;
  } catch {
    // Rate-limited, offline, or no geocoder available. The coordinate is still
    // valid and still gets saved - only the label is missing.
    return fallback;
  }
}
