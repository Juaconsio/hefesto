import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';

// Mock the repository/adapter layer so the service logic is tested in isolation.
vi.mock('@/modules/leasing/services/lease.service', () => ({
  leaseService: { listActive: vi.fn() },
}));
vi.mock('@/modules/billing/repositories/charge.repository', () => ({
  chargeRepository: {
    findByLeaseAndPeriod: vi.fn(),
    create: vi.fn(),
    totalByLease: vi.fn(),
    countPastDueByLease: vi.fn(),
  },
}));
vi.mock('@/modules/billing/repositories/payment.repository', () => ({
  paymentRepository: { confirmedTotalByLease: vi.fn() },
}));
vi.mock('@/modules/billing/services/mindicador.adapter', () => ({
  mindicadorAdapter: { ufValueAt: vi.fn() },
}));

import { billingService } from '@/modules/billing/services/billing.service';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { chargeRepository } from '@/modules/billing/repositories/charge.repository';
import { paymentRepository } from '@/modules/billing/repositories/payment.repository';
import { mindicadorAdapter } from '@/modules/billing/services/mindicador.adapter';

const dec = (v: string | number) => new Prisma.Decimal(v);
const clpLease = { id: 'clp', dueDay: 5, currency: 'CLP', baseAmount: dec('450000') };
const ufLease = { id: 'uf', dueDay: 5, currency: 'UF', baseAmount: dec('10') };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('generateMonthlyCharges', () => {
  it('creates one charge per active lease, resolving UF to CLP', async () => {
    vi.mocked(leaseService.listActive).mockResolvedValue([clpLease, ufLease] as never);
    vi.mocked(chargeRepository.findByLeaseAndPeriod).mockResolvedValue(null);
    vi.mocked(mindicadorAdapter.ufValueAt).mockResolvedValue(dec('39000'));
    vi.mocked(chargeRepository.create).mockResolvedValue({} as never);

    const res = await billingService.generateMonthlyCharges('2026-07');

    expect(res).toMatchObject({ created: 2, skipped: 0, total: 2 });
    // CLP charge = baseAmount
    expect(chargeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ leaseId: 'clp', amountClp: expect.anything() }),
    );
    // UF charge = 10 * 39000 = 390000, ufValue persisted
    const ufCall = vi.mocked(chargeRepository.create).mock.calls.find((c) => c[0].leaseId === 'uf');
    expect(ufCall?.[0].amountClp.toString()).toBe('390000');
    expect(ufCall?.[0].ufValue?.toString()).toBe('39000');
  });

  it('is idempotent: existing charges are skipped, none created', async () => {
    vi.mocked(leaseService.listActive).mockResolvedValue([clpLease, ufLease] as never);
    vi.mocked(chargeRepository.findByLeaseAndPeriod).mockResolvedValue({ id: 'existing' } as never);

    const res = await billingService.generateMonthlyCharges('2026-07');

    expect(res).toMatchObject({ created: 0, skipped: 2 });
    expect(chargeRepository.create).not.toHaveBeenCalled();
  });
});

describe('getMorosidad', () => {
  const lease = {
    id: 'l1',
    property: { alias: 'Depto' },
    tenant: { name: 'Juan' },
  };

  it('reports AL_DIA when fully paid', async () => {
    vi.mocked(leaseService.listActive).mockResolvedValue([lease] as never);
    vi.mocked(chargeRepository.totalByLease).mockResolvedValue(dec('450000'));
    vi.mocked(paymentRepository.confirmedTotalByLease).mockResolvedValue(dec('450000'));

    const [row] = await billingService.getMorosidad();
    expect(row).toMatchObject({ debt: '0', status: 'AL_DIA' });
    expect(chargeRepository.countPastDueByLease).not.toHaveBeenCalled();
  });

  it('reports ATRASADO with one past-due charge and a balance', async () => {
    vi.mocked(leaseService.listActive).mockResolvedValue([lease] as never);
    vi.mocked(chargeRepository.totalByLease).mockResolvedValue(dec('450000'));
    vi.mocked(paymentRepository.confirmedTotalByLease).mockResolvedValue(dec('0'));
    vi.mocked(chargeRepository.countPastDueByLease).mockResolvedValue(1);

    const [row] = await billingService.getMorosidad();
    expect(row).toMatchObject({ debt: '450000', status: 'ATRASADO' });
  });

  it('reports MOROSO with two or more past-due charges', async () => {
    vi.mocked(leaseService.listActive).mockResolvedValue([lease] as never);
    vi.mocked(chargeRepository.totalByLease).mockResolvedValue(dec('900000'));
    vi.mocked(paymentRepository.confirmedTotalByLease).mockResolvedValue(dec('0'));
    vi.mocked(chargeRepository.countPastDueByLease).mockResolvedValue(2);

    const [row] = await billingService.getMorosidad();
    expect(row.status).toBe('MOROSO');
  });

  it('never reports negative debt (overpaid clamps to 0)', async () => {
    vi.mocked(leaseService.listActive).mockResolvedValue([lease] as never);
    vi.mocked(chargeRepository.totalByLease).mockResolvedValue(dec('450000'));
    vi.mocked(paymentRepository.confirmedTotalByLease).mockResolvedValue(dec('500000'));

    const [row] = await billingService.getMorosidad();
    expect(row).toMatchObject({ debt: '0', status: 'AL_DIA' });
  });
});
