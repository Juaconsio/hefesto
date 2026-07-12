import { prisma } from '@/lib/prisma';
import type { ValidatedUtility } from '../domain/utility';

// The ONLY place that touches Prisma for utility accounts.

function toData(v: ValidatedUtility) {
  return {
    type: v.type,
    payer: v.payer,
    provider: v.provider,
    accountNumber: v.accountNumber,
    status: v.status,
    currentAmount: v.currentAmount,
    dueDate: v.dueDate,
    lastPaidAt: v.lastPaidAt,
  };
}

export const utilityRepository = {
  listByProperty(propertyId: string) {
    return prisma.utilityAccount.findMany({
      where: { propertyId },
      orderBy: { type: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.utilityAccount.findUnique({ where: { id } });
  },

  create(v: ValidatedUtility) {
    return prisma.utilityAccount.create({
      data: { ...toData(v), property: { connect: { id: v.propertyId } } },
    });
  },

  update(id: string, v: ValidatedUtility) {
    return prisma.utilityAccount.update({ where: { id }, data: toData(v) });
  },

  delete(id: string) {
    return prisma.utilityAccount.delete({ where: { id } });
  },
};
