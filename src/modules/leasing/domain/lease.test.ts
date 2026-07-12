import { describe, it, expect } from 'vitest';
import { canTransition, assertTransition, validateLease } from './lease';

const base = {
  propertyId: 'p1',
  tenantId: 't1',
  baseAmount: 450000,
  currency: 'CLP' as const,
  dueDay: 5,
  startDate: new Date('2026-01-01'),
};

describe('lease state machine', () => {
  it('allows DRAFT->ACTIVE and ACTIVE->TERMINATED', () => {
    expect(canTransition('DRAFT', 'ACTIVE')).toBe(true);
    expect(canTransition('ACTIVE', 'TERMINATED')).toBe(true);
  });

  it('blocks illegal transitions', () => {
    expect(canTransition('DRAFT', 'TERMINATED')).toBe(false);
    expect(canTransition('ACTIVE', 'DRAFT')).toBe(false);
    expect(canTransition('TERMINATED', 'ACTIVE')).toBe(false);
    expect(() => assertTransition('TERMINATED', 'ACTIVE')).toThrow();
  });
});

describe('validateLease', () => {
  it('accepts a valid CLP lease and normalizes amounts', () => {
    const v = validateLease({ ...base, depositAmount: 450000 });
    expect(v.baseAmount).toBe('450000.00');
    expect(v.depositAmount).toBe('450000.00');
    expect(v.adjustmentType).toBe('NONE');
    expect(v.adjustmentPeriodMonths).toBeNull();
  });

  it('rejects non-positive amount', () => {
    expect(() => validateLease({ ...base, baseAmount: 0 })).toThrow();
  });

  it('rejects dueDay outside 1..31', () => {
    expect(() => validateLease({ ...base, dueDay: 0 })).toThrow();
    expect(() => validateLease({ ...base, dueDay: 32 })).toThrow();
  });

  it('IPC adjustment only allowed for CLP', () => {
    expect(() =>
      validateLease({ ...base, currency: 'UF', adjustmentType: 'IPC', adjustmentPeriodMonths: 12 }),
    ).toThrow();
    const v = validateLease({ ...base, adjustmentType: 'IPC', adjustmentPeriodMonths: 12 });
    expect(v.adjustmentType).toBe('IPC');
    expect(v.adjustmentPeriodMonths).toBe(12);
  });

  it('requires a positive period when adjustment is not NONE', () => {
    expect(() => validateLease({ ...base, adjustmentType: 'IPC' })).toThrow();
  });

  it('rejects endDate before or equal to startDate', () => {
    expect(() =>
      validateLease({ ...base, endDate: new Date('2025-12-31') }),
    ).toThrow();
  });
});
