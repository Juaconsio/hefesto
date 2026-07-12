import { describe, it, expect } from 'vitest';
import { roundClp, ufToClp, formatClp, formatUf, formatMoney, toDecimal } from './money';

describe('money', () => {
  it('rounds CLP to the peso (half up)', () => {
    expect(roundClp('100.4').toString()).toBe('100');
    expect(roundClp('100.5').toString()).toBe('101');
    expect(roundClp('100.49').toString()).toBe('100');
  });

  it('resolves UF to CLP rounded to the peso', () => {
    // 10 UF * 39000.5 = 390005 → rounded 390005
    expect(ufToClp('10', '39000.5').toString()).toBe('390005');
    // 12.5 UF * 39000 = 487500
    expect(ufToClp('12.5', '39000').toString()).toBe('487500');
  });

  it('toDecimal builds a Decimal', () => {
    expect(toDecimal('1234.56').toFixed(2)).toBe('1234.56');
  });

  it('formats CLP without decimals', () => {
    // non-breaking spaces / separators vary by ICU; assert key parts
    const s = formatClp('450000');
    expect(s).toContain('450');
    expect(s).toContain('$');
    expect(s).not.toContain(',00');
  });

  it('formats UF with two decimals', () => {
    expect(formatUf('12.5')).toBe('UF 12,50');
  });

  it('formatMoney dispatches by currency', () => {
    expect(formatMoney('12.5', 'UF')).toBe('UF 12,50');
    expect(formatMoney('450000', 'CLP')).toContain('$');
  });
});
