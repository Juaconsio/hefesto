import { prisma } from '@/lib/prisma';
import type { Prisma, LeaseStatus } from '@prisma/client';
import type { ValidatedLease } from '../domain/lease';

// The ONLY place that touches Prisma for leases.

function toWriteData(v: ValidatedLease) {
  return {
    baseAmount: v.baseAmount,
    currency: v.currency,
    dueDay: v.dueDay,
    adjustmentType: v.adjustmentType,
    adjustmentPeriodMonths: v.adjustmentPeriodMonths,
    nextAdjustment: v.nextAdjustment,
    depositAmount: v.depositAmount,
    startDate: v.startDate,
    endDate: v.endDate,
  };
}

export const leaseRepository = {
  list() {
    return prisma.lease.findMany({
      orderBy: { createdAt: 'desc' },
      include: { property: true, tenant: true },
    });
  },

  findById(id: string) {
    return prisma.lease.findUnique({
      where: { id },
      include: {
        property: { include: { owner: true } },
        tenant: true,
        charges: { orderBy: { period: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
  },

  findActiveByProperty(propertyId: string) {
    return prisma.lease.findFirst({
      where: { propertyId, status: 'ACTIVE' },
      include: { tenant: true },
    });
  },

  listActive() {
    return prisma.lease.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { property: true, tenant: true },
    });
  },

  create(v: ValidatedLease) {
    return prisma.lease.create({
      data: {
        ...toWriteData(v),
        property: { connect: { id: v.propertyId } },
        tenant: { connect: { id: v.tenantId } },
      },
    });
  },

  update(id: string, v: ValidatedLease) {
    return prisma.lease.update({
      where: { id },
      data: {
        ...toWriteData(v),
        property: { connect: { id: v.propertyId } },
        tenant: { connect: { id: v.tenantId } },
      },
    });
  },

  updateStatus(id: string, status: LeaseStatus) {
    return prisma.lease.update({ where: { id }, data: { status } });
  },
};

export type LeaseWithRelations = Prisma.LeaseGetPayload<{
  include: { property: true; tenant: true };
}>;
export type LeaseDetail = NonNullable<Awaited<ReturnType<typeof leaseRepository.findById>>>;
