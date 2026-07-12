import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { ValidatedExpense } from '../domain/expense';

// The ONLY place that touches Prisma for expenses.

export const expenseRepository = {
  listByProperty(propertyId: string) {
    return prisma.expense.findMany({ where: { propertyId }, orderBy: { date: 'desc' } });
  },

  findById(id: string) {
    return prisma.expense.findUnique({ where: { id } });
  },

  create(v: ValidatedExpense) {
    return prisma.expense.create({
      data: {
        property: { connect: { id: v.propertyId } },
        category: v.category,
        description: v.description,
        amount: v.amount,
        date: v.date,
        billableToOwner: v.billableToOwner,
        receiptUrl: v.receiptUrl,
        photoUrl: v.photoUrl,
      },
    });
  },

  delete(id: string) {
    return prisma.expense.delete({ where: { id } });
  },

  /** Total spent (CLP) on a property (0 if none). */
  async totalByProperty(propertyId: string): Promise<Prisma.Decimal> {
    const result = await prisma.expense.aggregate({
      where: { propertyId },
      _sum: { amount: true },
    });
    return result._sum.amount ?? new Prisma.Decimal(0);
  },
};
