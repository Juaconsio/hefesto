import { describe, it, expect } from 'vitest';
import { validateExpense } from './expense';

const base = {
  propertyId: 'p1',
  category: 'REPAIR' as const,
  description: 'Fuga de agua',
  amount: 50000,
  date: new Date('2026-07-01'),
};

describe('validateExpense', () => {
  it('accepts a non-billable expense without evidence', () => {
    const v = validateExpense(base);
    expect(v.billableToOwner).toBe(false);
    expect(v.amount).toBe('50000.00');
  });

  it('rejects a billable expense without receipt or photo', () => {
    expect(() => validateExpense({ ...base, billableToOwner: true })).toThrow();
  });

  it('accepts a billable expense with a photo', () => {
    const v = validateExpense({ ...base, billableToOwner: true, photoUrl: 'https://x/f.jpg' });
    expect(v.photoUrl).toBe('https://x/f.jpg');
  });

  it('accepts a billable expense with a receipt', () => {
    const v = validateExpense({ ...base, billableToOwner: true, receiptUrl: 'https://x/b.pdf' });
    expect(v.receiptUrl).toBe('https://x/b.pdf');
  });

  it('requires description and positive amount', () => {
    expect(() => validateExpense({ ...base, description: '  ' })).toThrow();
    expect(() => validateExpense({ ...base, amount: 0 })).toThrow();
  });
});
