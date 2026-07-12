import { describe, it, expect } from 'vitest';
import { resolveDueDate, resolveAmountClp } from './charge';

describe('resolveDueDate', () => {
  it('builds a UTC calendar day from period + dueDay', () => {
    expect(resolveDueDate('2026-07', 5).toISOString()).toBe('2026-07-05T00:00:00.000Z');
  });

  it('clamps dueDay to the month length', () => {
    expect(resolveDueDate('2026-02', 31).toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(resolveDueDate('2024-02', 31).toISOString()).toBe('2024-02-29T00:00:00.000Z'); // leap
  });

  it('rejects a malformed period', () => {
    expect(() => resolveDueDate('2026/07', 5)).toThrow();
    expect(() => resolveDueDate('2026-13', 5)).toThrow();
  });
});

describe('resolveAmountClp', () => {
  it('CLP uses baseAmount rounded to peso', () => {
    expect(resolveAmountClp('450000', 'CLP').toString()).toBe('450000');
  });

  it('UF multiplies baseAmount by the UF value', () => {
    expect(resolveAmountClp('10', 'UF', '39000').toString()).toBe('390000');
  });

  it('UF without a value throws', () => {
    expect(() => resolveAmountClp('10', 'UF')).toThrow();
    expect(() => resolveAmountClp('10', 'UF', null)).toThrow();
  });
});
