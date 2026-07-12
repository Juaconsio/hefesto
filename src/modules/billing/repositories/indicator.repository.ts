import { prisma } from '@/lib/prisma';
import type { IndicatorType, Prisma } from '@prisma/client';

// The ONLY place that touches Prisma for IndicatorValue (UF/IPC cache).
// Dates are normalized to midnight UTC so the (type, date) unique key is stable.

function atUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export const indicatorRepository = {
  findByTypeAndDate(type: IndicatorType, date: Date) {
    return prisma.indicatorValue.findUnique({
      where: { type_date: { type, date: atUtcMidnight(date) } },
    });
  },

  findLatest(type: IndicatorType) {
    return prisma.indicatorValue.findFirst({
      where: { type },
      orderBy: { date: 'desc' },
    });
  },

  upsert(type: IndicatorType, date: Date, value: Prisma.Decimal.Value) {
    const day = atUtcMidnight(date);
    return prisma.indicatorValue.upsert({
      where: { type_date: { type, date: day } },
      update: { value },
      create: { type, date: day, value },
    });
  },
};
