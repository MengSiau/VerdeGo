// Placeholder coordinates for the fixed set of pickup suggestions and the (fixed)
// destination, until the app has a real map/geocoding feature. These are rough
// Melbourne-area coordinates, good enough to satisfy the backend's origin/destination
// lat/lng columns (there's no place-name column in the schema).

export type LocationOption = {
  name: string;
  lat: number;
  lng: number;
};

export const DESTINATION: LocationOption = {
  name: 'Monash Clayton Campus',
  lat: -37.9105,
  lng: 145.1362,
};

export const PICKUP_OPTIONS: LocationOption[] = [
  { name: 'Glen Waverley Station', lat: -37.8799, lng: 145.1595 },
  { name: 'Brandon Park Shopping Centre', lat: -37.8805, lng: 145.1766 },
  { name: 'Springvale Station', lat: -37.949, lng: 145.1526 },
];

export const DEFAULT_PICKUP: LocationOption = PICKUP_OPTIONS[0];

export function findPickupByName(name: string | undefined): LocationOption {
  return PICKUP_OPTIONS.find((option) => option.name === name) ?? DEFAULT_PICKUP;
}
