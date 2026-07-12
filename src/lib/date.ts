// Time handling. We store datetimes in UTC (Prisma/Postgres default) and present
// them in America/Santiago. Care is needed for due dates and the monthly billing
// job around Chile's daylight-saving transitions — always derive the local
// calendar day from the Santiago timezone, never from the server's local time.

export const APP_TIMEZONE = 'America/Santiago';

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-CL', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** Present a date in America/Santiago, e.g. "12-07-2026". */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return dateFormatter.format(typeof date === 'string' ? new Date(date) : date);
}

/** Present a datetime in America/Santiago, e.g. "12-07-2026 09:30". */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return dateTimeFormatter.format(typeof date === 'string' ? new Date(date) : date);
}

/**
 * Parse a plain "YYYY-MM-DD" from a date <input> into a UTC Date anchored at
 * midnight UTC. We keep the calendar day stable regardless of server timezone.
 */
export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a Date as "YYYY-MM-DD" for a date <input> value (UTC calendar day). */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

/** Current period as "YYYY-MM" in America/Santiago. */
export function currentPeriod(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const year = parts.find((p) => p.type === 'year')!.value;
  const month = parts.find((p) => p.type === 'month')!.value;
  return `${year}-${month}`;
}
