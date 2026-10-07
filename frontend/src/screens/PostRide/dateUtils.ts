// Date helpers for the Post Ride flow. The draft stores the calendar day as a plain
// "YYYY-MM-DD" string (departureDate) separate from the hour/minute/period fields, so
// this combines them back into a real Date/ISO string when it's time to submit.

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatFullDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function buildDepartureIso(departureDateIso: string, hour: string, minute: string, period: 'AM' | 'PM') {
  const [year, month, day] = departureDateIso.split('-').map(Number);
  let hours = parseInt(hour, 10) % 12;
  if (period === 'PM') hours += 12;
  const date = new Date(year, month - 1, day, hours, parseInt(minute, 10), 0, 0);
  return date.toISOString();
}
