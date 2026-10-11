export type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * Decodes Google's Encoded Polyline Algorithm Format into coordinates.
 *
 * Google returns routes as a compressed ASCII string rather than a list of
 * points - a route with hundreds of vertices becomes a few hundred characters.
 * This is the standard decoder; the format is documented at
 * developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): Coordinate[] {
  const points: Coordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    lat += decodeValue();
    lng += decodeValue();

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;

  // Each value is stored as a series of 5-bit chunks, offset by 63 to keep
  // them printable, with bit 6 set on every chunk except the last.
  function decodeValue(): number {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    // Negative values are stored with the sign bit in position 0.
    return result & 1 ? ~(result >> 1) : result >> 1;
  }
}
