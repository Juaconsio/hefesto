import { describe, it, expect } from 'vitest';
import { isValidRut, normalizeRut, formatRut, computeCheckDigit, cleanRut } from './rut';

describe('rut módulo 11', () => {
  it('validates a correct check digit', () => {
    const body = '12345678';
    const dv = computeCheckDigit(body);
    expect(isValidRut(`${body}-${dv}`)).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    const body = '12345678';
    const dv = computeCheckDigit(body);
    const wrong = dv === '0' ? '1' : '0';
    expect(isValidRut(`${body}-${wrong}`)).toBe(false);
  });

  it('handles K check digit case-insensitively', () => {
    // Find a body whose check digit is K.
    let body = 1000000;
    while (computeCheckDigit(String(body)) !== 'K') body++;
    expect(isValidRut(`${body}-k`)).toBe(true);
    expect(isValidRut(`${body}-K`)).toBe(true);
  });

  it('accepts formatted input with dots and hyphen', () => {
    const dv = computeCheckDigit('12345678');
    expect(isValidRut(`12.345.678-${dv}`)).toBe(true);
  });

  it('rejects garbage and too-short input', () => {
    expect(isValidRut('abc')).toBe(false);
    expect(isValidRut('123')).toBe(false);
    expect(isValidRut('')).toBe(false);
  });

  it('normalizes to bare "body-dv" form', () => {
    const dv = computeCheckDigit('12345678');
    expect(normalizeRut(`12.345.678-${dv}`)).toBe(`12345678-${dv}`);
  });

  it('throws when normalizing an invalid rut', () => {
    expect(() => normalizeRut('12345678-0')).toThrow();
  });

  it('formats with dots for display', () => {
    expect(formatRut('12345678-5')).toBe('12.345.678-5');
  });

  it('cleans dots/hyphen/space and uppercases k', () => {
    expect(cleanRut('12.345.678-k')).toBe('12345678K');
  });
});
