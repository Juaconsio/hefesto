import { Prisma } from '@prisma/client';
import { DomainError } from '@/lib/errors';
import { ufToClp, roundClp } from '@/lib/money';
import type { Currency } from '@prisma/client';

// Pure domain: how a monthly charge is derived. No Prisma, no HTTP.

/** Number of days in the month of a "YYYY-MM" period. */
function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

/**
 * Resolve the due date for a period + dueDay, clamping the day to the month length
 * (e.g. dueDay 31 in February → 28/29). Anchored to a UTC calendar day; the app
 * presents it in America/Santiago.
 */
export function resolveDueDate(period: string, dueDay: number): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) throw new DomainError(`Período inválido: ${period} (se espera YYYY-MM).`);
  const year = Number(match[1]);
  const month1 = Number(match[2]); // 1-12
  if (month1 < 1 || month1 > 12) throw new DomainError(`Mes inválido en período: ${period}.`);
  const day = Math.min(dueDay, daysInMonth(year, month1));
  return new Date(Date.UTC(year, month1 - 1, day));
}

/**
 * Resolve the CLP amount of a charge. CLP contracts use baseAmount directly;
 * UF contracts multiply by the UF value at the due date. Rounded to the peso.
 */
export function resolveAmountClp(
  baseAmount: Prisma.Decimal.Value,
  currency: Currency,
  ufValue?: Prisma.Decimal.Value | null,
): Prisma.Decimal {
  if (currency === 'UF') {
    if (ufValue === undefined || ufValue === null) {
      throw new DomainError('Falta el valor de UF para resolver el cargo.');
    }
    return ufToClp(baseAmount, ufValue);
  }
  return roundClp(baseAmount);
}
