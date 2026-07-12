import { describe, it, expect } from 'vitest';
import { validateUtility } from './utility';

const base = {
  propertyId: 'p1',
  type: 'ELECTRICITY' as const,
  payer: 'TENANT' as const,
};

describe('validateUtility', () => {
  it('defaults status to CURRENT and nulls empties', () => {
    const v = validateUtility(base);
    expect(v.status).toBe('CURRENT');
    expect(v.currentAmount).toBeNull();
    expect(v.provider).toBeNull();
  });

  it('normalizes currentAmount to 2 decimals', () => {
    const v = validateUtility({ ...base, currentAmount: 25000 });
    expect(v.currentAmount).toBe('25000.00');
  });

  it('rejects a negative amount', () => {
    expect(() => validateUtility({ ...base, currentAmount: -5 })).toThrow();
  });

  it('requires a property', () => {
    expect(() => validateUtility({ ...base, propertyId: '' })).toThrow();
  });
});
