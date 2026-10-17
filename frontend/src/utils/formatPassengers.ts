// Shared by RideCard and MyRideCard, which both need a compact "who's on this ride"
// line without overflowing a tile - the full list lives on RideOverview instead.
export function formatJoinedPassengers(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
}
