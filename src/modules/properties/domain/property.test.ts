import { describe, it, expect } from 'vitest';
import { validateProperty } from './property';

const base = {
  ownerId: 'owner-1',
  alias: 'Depto',
  address: 'Calle 1',
  comuna: 'Ñuñoa',
  type: 'APARTMENT' as const,
};

describe('validateProperty — tenure/commission rule', () => {
  it('OWNED without commission is valid and defaults status AVAILABLE', () => {
    const v = validateProperty({ ...base, tenure: 'OWNED' });
    expect(v.commissionPct).toBeNull();
    expect(v.status).toBe('AVAILABLE');
    expect(v.dfl2).toBe(false);
  });

  it('OWNED with commission is rejected', () => {
    expect(() => validateProperty({ ...base, tenure: 'OWNED', commissionPct: 8 })).toThrow();
  });

  it('MANAGED requires commission', () => {
    expect(() => validateProperty({ ...base, tenure: 'MANAGED' })).toThrow();
  });

  it('MANAGED with commission normalizes to 2 decimals', () => {
    const v = validateProperty({ ...base, tenure: 'MANAGED', commissionPct: 8 });
    expect(v.commissionPct).toBe('8.00');
  });

  it('rejects commission out of 0..100', () => {
    expect(() => validateProperty({ ...base, tenure: 'MANAGED', commissionPct: 150 })).toThrow();
    expect(() => validateProperty({ ...base, tenure: 'MANAGED', commissionPct: -1 })).toThrow();
  });

  it('requires alias, address, comuna, owner', () => {
    expect(() => validateProperty({ ...base, alias: '  ', tenure: 'OWNED' })).toThrow();
    expect(() => validateProperty({ ...base, address: '', tenure: 'OWNED' })).toThrow();
    expect(() => validateProperty({ ...base, comuna: '', tenure: 'OWNED' })).toThrow();
    expect(() => validateProperty({ ...base, ownerId: '', tenure: 'OWNED' })).toThrow();
  });

  it('trims text fields and nulls empty siiRol', () => {
    const v = validateProperty({ ...base, alias: '  Depto  ', tenure: 'OWNED' });
    expect(v.alias).toBe('Depto');
    expect(v.siiRol).toBeNull();
  });
});
