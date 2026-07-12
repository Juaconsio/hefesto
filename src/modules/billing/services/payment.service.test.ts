import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/modules/leasing/services/lease.service', () => ({
  leaseService: { getById: vi.fn() },
}));
vi.mock('@/modules/billing/repositories/charge.repository', () => ({
  chargeRepository: { findById: vi.fn() },
}));
vi.mock('@/modules/billing/repositories/payment.repository', () => ({
  paymentRepository: { create: vi.fn() },
}));

import { paymentService } from '@/modules/billing/services/payment.service';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { chargeRepository } from '@/modules/billing/repositories/charge.repository';
import { paymentRepository } from '@/modules/billing/repositories/payment.repository';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('paymentService.registerManualPayment', () => {
  it('creates a CONFIRMED payment with a default paidAt', async () => {
    vi.mocked(leaseService.getById).mockResolvedValue({ id: 'l1' } as never);
    vi.mocked(paymentRepository.create).mockResolvedValue({} as never);

    await paymentService.registerManualPayment({ leaseId: 'l1', amount: 450000 });

    const arg = vi.mocked(paymentRepository.create).mock.calls[0][0];
    expect(arg.status).toBe('CONFIRMED');
    expect(arg.amount).toBe('450000.00');
    expect(arg.paidAt).toBeInstanceOf(Date);
  });

  it('rejects when the lease does not exist', async () => {
    vi.mocked(leaseService.getById).mockResolvedValue(null as never);
    await expect(
      paymentService.registerManualPayment({ leaseId: 'x', amount: 1000 }),
    ).rejects.toThrow();
  });

  it('rejects a charge that belongs to another lease', async () => {
    vi.mocked(leaseService.getById).mockResolvedValue({ id: 'l1' } as never);
    vi.mocked(chargeRepository.findById).mockResolvedValue({
      id: 'c1',
      leaseId: 'OTHER',
    } as never);

    await expect(
      paymentService.registerManualPayment({ leaseId: 'l1', chargeId: 'c1', amount: 1000 }),
    ).rejects.toThrow();
    expect(paymentRepository.create).not.toHaveBeenCalled();
  });

  it('accepts a charge that belongs to the lease', async () => {
    vi.mocked(leaseService.getById).mockResolvedValue({ id: 'l1' } as never);
    vi.mocked(chargeRepository.findById).mockResolvedValue({ id: 'c1', leaseId: 'l1' } as never);
    vi.mocked(paymentRepository.create).mockResolvedValue({} as never);

    await paymentService.registerManualPayment({ leaseId: 'l1', chargeId: 'c1', amount: 1000 });
    expect(paymentRepository.create).toHaveBeenCalled();
  });
});
