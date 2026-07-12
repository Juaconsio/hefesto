import { describe, it, expect } from 'vitest';
import { currentPeriod, parseDateInput, toDateInputValue, formatDate, shiftPeriod } from './date';

describe('date helpers', () => {
  it('derives the current period (YYYY-MM) in Santiago tz', () => {
    // 2026-01-01 00:30 UTC is still 2025-12-31 in Santiago (UTC-3) → period 2025-12
    const p = currentPeriod(new Date('2026-01-01T00:30:00Z'));
    expect(p).toBe('2025-12');
  });

  it('current period matches the same UTC day mid-month', () => {
    expect(currentPeriod(new Date('2026-07-15T12:00:00Z'))).toBe('2026-07');
  });

  it('parses a date input to a UTC-midnight calendar day', () => {
    const d = parseDateInput('2026-07-05');
    expect(d.toISOString()).toBe('2026-07-05T00:00:00.000Z');
  });

  it('round-trips toDateInputValue <-> parseDateInput', () => {
    expect(toDateInputValue(parseDateInput('2026-02-28'))).toBe('2026-02-28');
  });

  it('formats a nullish date as a dash', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('shifts a period across year boundaries', () => {
    expect(shiftPeriod('2026-07', 1)).toBe('2026-08');
    expect(shiftPeriod('2026-01', -1)).toBe('2025-12');
    expect(shiftPeriod('2026-12', 1)).toBe('2027-01');
    expect(shiftPeriod('2026-03', -5)).toBe('2025-10');
  });
});
