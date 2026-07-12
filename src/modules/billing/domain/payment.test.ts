import { describe, it, expect } from 'vitest';
import { canPaymentTransition, assertPaymentTransition, validatePaymentAmount } from './payment';

describe('payment state machine', () => {
  it('allows PENDING->CONFIRMED and PENDING->FAILED', () => {
    expect(canPaymentTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canPaymentTransition('PENDING', 'FAILED')).toBe(true);
  });

  it('does not allow leaving a terminal state', () => {
    expect(canPaymentTransition('CONFIRMED', 'FAILED')).toBe(false);
    expect(canPaymentTransition('FAILED', 'CONFIRMED')).toBe(false);
    expect(() => assertPaymentTransition('CONFIRMED', 'FAILED')).toThrow();
  });
});

describe('validatePaymentAmount', () => {
  it('accepts a positive amount, normalized to 2 decimals', () => {
    expect(validatePaymentAmount(450000)).toBe('450000.00');
  });

  it('rejects zero, negatives and NaN', () => {
    expect(() => validatePaymentAmount(0)).toThrow();
    expect(() => validatePaymentAmount(-1)).toThrow();
    expect(() => validatePaymentAmount('abc')).toThrow();
  });
});
