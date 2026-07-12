import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// The ONLY place that touches Prisma for charges (append-only ledger).

export interface ChargeCreate {
  leaseId: string;
  period: string;
  amountClp: Prisma.Decimal.Value;
  ufValue?: Prisma.Decimal.Value | null;
  dueDate: Date;
}

export const chargeRepository = {
  findById(id: string) {
    return prisma.charge.findUnique({ where: { id } });
  },

  findByLeaseAndPeriod(leaseId: string, period: string) {
    return prisma.charge.findUnique({ where: { leaseId_period: { leaseId, period } } });
  },

  listByPeriod(period: string) {
    return prisma.charge.findMany({
      where: { period },
      orderBy: { dueDate: 'asc' },
      include: {
        lease: { include: { property: true, tenant: true } },
        payments: { where: { status: 'CONFIRMED' } },
      },
    });
  },

  listByLease(leaseId: string) {
    return prisma.charge.findMany({ where: { leaseId }, orderBy: { period: 'desc' } });
  },

  /** Total charged (CLP) for a lease (0 if none). */
  async totalByLease(leaseId: string): Promise<Prisma.Decimal> {
    const result = await prisma.charge.aggregate({
      where: { leaseId },
      _sum: { amountClp: true },
    });
    return result._sum.amountClp ?? new Prisma.Decimal(0);
  },

  countPastDueByLease(leaseId: string, now: Date) {
    return prisma.charge.count({ where: { leaseId, dueDate: { lt: now } } });
  },

  create(data: ChargeCreate) {
    return prisma.charge.create({
      data: {
        lease: { connect: { id: data.leaseId } },
        period: data.period,
        amountClp: data.amountClp,
        ufValue: data.ufValue ?? null,
        dueDate: data.dueDate,
      },
    });
  },
};

export type ChargeWithPayments = Prisma.ChargeGetPayload<{
  include: {
    lease: { include: { property: true; tenant: true } };
    payments: true;
  };
}>;
