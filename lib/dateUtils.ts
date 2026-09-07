/**
 * Centralized Date & Time formatting utilities locked to Asia/Karachi (PKT).
 * All admin panel components MUST use these functions instead of raw
 * toLocaleString() or toLocaleDateString() to guarantee consistent rendering
 * regardless of the client machine's browser locale or timezone offset.
 */

export const KARACHI_TZ = 'Asia/Karachi';

export function formatKarachiDateTime(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: KARACHI_TZ,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  }).format(d);
}

export function formatKarachiDate(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: KARACHI_TZ,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(d);
}

export function formatKarachiTime(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: KARACHI_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  }).format(d);
}
