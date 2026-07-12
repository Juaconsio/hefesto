import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { PaymentStatus } from '@prisma/client';

// The ONLY place that touches Prisma for payments.

export interface PaymentCreate {
  leaseId: string;
  chargeId?: string | null;
  amount: Prisma.Decimal.Value;
  paidAt: Date | null;
  status: PaymentStatus;
  receiptUrl?: string | null;
}

export const paymentRepository = {
  findById(id: string) {
    return prisma.payment.findUnique({ where: { id } });
  },

  listByLease(leaseId: string) {
    return prisma.payment.findMany({ where: { leaseId }, orderBy: { createdAt: 'desc' } });
  },

  create(data: PaymentCreate) {
    return prisma.payment.create({
      data: {
        lease: { connect: { id: data.leaseId } },
        charge: data.chargeId ? { connect: { id: data.chargeId } } : undefined,
        amount: data.amount,
        paidAt: data.paidAt,
        method: 'MANUAL',
        status: data.status,
        receiptUrl: data.receiptUrl ?? null,
      },
    });
  },

  updateStatus(id: string, status: PaymentStatus) {
    return prisma.payment.update({ where: { id }, data: { status } });
  },

  /** Total of CONFIRMED payments for a lease (0 if none). */
  async confirmedTotalByLease(leaseId: string): Promise<Prisma.Decimal> {
    const result = await prisma.payment.aggregate({
      where: { leaseId, status: 'CONFIRMED' },
      _sum: { amount: true },
    });
    return result._sum.amount ?? new Prisma.Decimal(0);
  },
};
