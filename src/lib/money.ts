import { Prisma } from '@prisma/client';

// Money handling. We never use JS number/float for money. Arithmetic goes
// through Prisma.Decimal (decimal.js under the hood) — no extra dependency.
// CLP is rounded to the peso (no decimals); UF-denominated amounts keep decimals
// until they are resolved to CLP in a Charge.

export type Money = Prisma.Decimal;

export const Decimal = Prisma.Decimal;

export function toDecimal(value: Prisma.Decimal.Value): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

/** Round a CLP amount to the nearest peso (no decimals). */
export function roundClp(value: Prisma.Decimal.Value): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
}

/** Resolve a UF amount to CLP using the given UF value, rounded to the peso. */
export function ufToClp(
  ufAmount: Prisma.Decimal.Value,
  ufValue: Prisma.Decimal.Value,
): Prisma.Decimal {
  return roundClp(new Prisma.Decimal(ufAmount).times(ufValue));
}

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const ufFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a CLP amount for the UI, e.g. "$450.000". */
export function formatClp(value: Prisma.Decimal.Value): string {
  return clpFormatter.format(new Prisma.Decimal(value).toNumber());
}

/** Format a UF amount for the UI, e.g. "UF 12,50". */
export function formatUf(value: Prisma.Decimal.Value): string {
  return `UF ${ufFormatter.format(new Prisma.Decimal(value).toNumber())}`;
}

/** Format an amount according to its currency. */
export function formatMoney(value: Prisma.Decimal.Value, currency: 'CLP' | 'UF'): string {
  return currency === 'UF' ? formatUf(value) : formatClp(value);
}
