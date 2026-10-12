/**
 * One place for ride date and time formatting.
 *
 * The draft stores a single ISO timestamp; every string the user sees is
 * derived from it here. The previous approach - storing "Wed, Aug 13" and
 * parsing it back - lost the year, which is how rides ended up stamped 2025.
 */

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** "Wed, 13 Aug 2026" - matches what rideAdapter produces for API rides. */
export function formatRideDate(value: Date | string): string {
  return toDate(value).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "8:15 AM" */
export function formatRideTime(value: Date | string): string {
  return toDate(value).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Used for the drop-off estimate: departure plus the route duration. */
export function addMinutes(value: Date | string, minutes: number): Date {
  return new Date(toDate(value).getTime() + minutes * 60_000);
}

/** True when two dates fall on the same calendar day, ignoring the time. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Sensible starting point for a new ride: 8:15 this morning if that hasn't
 * passed yet, otherwise 8:15 tomorrow. Never a time in the past, which the
 * Routes API rejects for traffic-aware requests.
 */
export function defaultDeparture(now: Date = new Date()): Date {
  const candidate = new Date(now);
  candidate.setHours(8, 15, 0, 0);
  if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
  return candidate;
}