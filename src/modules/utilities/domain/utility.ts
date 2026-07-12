import { DomainError } from '@/lib/errors';
import type { UtilityType, UtilityPayer, UtilityStatus } from '@prisma/client';

// Pure domain: UtilityAccount rules + labels. One row per account type per property,
// with who pays (administrator/tenant) and the current status/amount.

export const UTILITY_TYPE_LABELS: Record<UtilityType, string> = {
  ELECTRICITY: 'Luz',
  WATER: 'Agua',
  GAS: 'Gas',
  PROPERTY_TAX: 'Contribuciones',
  CLEANING_LIGHTING: 'Aseo y ornato',
  COMMON_EXPENSES: 'Gastos comunes',
};

export const UTILITY_PAYER_LABELS: Record<UtilityPayer, string> = {
  ADMINISTRATOR: 'Administradora',
  TENANT: 'Arrendatario',
};

export const UTILITY_STATUS_LABELS: Record<UtilityStatus, string> = {
  CURRENT: 'Al día',
  PENDING: 'Pendiente',
  OVERDUE: 'Vencida',
};

export interface UtilityInput {
  propertyId: string;
  type: UtilityType;
  payer: UtilityPayer;
  provider?: string | null;
  accountNumber?: string | null;
  status?: UtilityStatus;
  currentAmount?: number | string | null;
  dueDate?: Date | null;
  lastPaidAt?: Date | null;
}

export interface ValidatedUtility {
  propertyId: string;
  type: UtilityType;
  payer: UtilityPayer;
  provider: string | null;
  accountNumber: string | null;
  status: UtilityStatus;
  currentAmount: string | null;
  dueDate: Date | null;
  lastPaidAt: Date | null;
}

export function validateUtility(input: UtilityInput): ValidatedUtility {
  if (!input.propertyId) throw new DomainError('Falta el inmueble.');

  let currentAmount: string | null = null;
  if (input.currentAmount !== null && input.currentAmount !== undefined && input.currentAmount !== '') {
    const n = Number(input.currentAmount);
    if (Number.isNaN(n) || n < 0) throw new DomainError('El monto debe ser un número válido.');
    currentAmount = n.toFixed(2);
  }

  return {
    propertyId: input.propertyId,
    type: input.type,
    payer: input.payer,
    provider: input.provider?.trim() || null,
    accountNumber: input.accountNumber?.trim() || null,
    status: input.status ?? 'CURRENT',
    currentAmount,
    dueDate: input.dueDate ?? null,
    lastPaidAt: input.lastPaidAt ?? null,
  };
}
