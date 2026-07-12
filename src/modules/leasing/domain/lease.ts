import { DomainError } from '@/lib/errors';
import type { Currency, AdjustmentType, LeaseStatus } from '@prisma/client';

// Pure domain: Lease rules + the explicit state machine.
// Lifecycle: DRAFT -> ACTIVE -> TERMINATED. Illegal transitions are blocked.

export interface LeaseInput {
  propertyId: string;
  tenantId: string;
  baseAmount: number | string;
  currency: Currency;
  dueDay: number | string;
  adjustmentType?: AdjustmentType;
  adjustmentPeriodMonths?: number | string | null;
  nextAdjustment?: Date | null;
  depositAmount?: number | string | null;
  startDate: Date;
  endDate?: Date | null;
}

export interface ValidatedLease {
  propertyId: string;
  tenantId: string;
  baseAmount: string;
  currency: Currency;
  dueDay: number;
  adjustmentType: AdjustmentType;
  adjustmentPeriodMonths: number | null;
  nextAdjustment: Date | null;
  depositAmount: string | null;
  startDate: Date;
  endDate: Date | null;
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  CLP: 'Pesos (CLP)',
  UF: 'UF',
};

export const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  NONE: 'Sin reajuste',
  IPC: 'IPC acumulado',
  UF: 'UF',
  FIXED: 'Monto fijo pactado',
};

export const LEASE_STATUS_LABELS: Record<LeaseStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Vigente',
  TERMINATED: 'Terminado',
};

// Allowed transitions of the state machine.
const LEASE_TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['TERMINATED'],
  TERMINATED: [],
};

export function canTransition(from: LeaseStatus, to: LeaseStatus): boolean {
  return LEASE_TRANSITIONS[from].includes(to);
}

/** Assert a legal transition or throw a DomainError. */
export function assertTransition(from: LeaseStatus, to: LeaseStatus): void {
  if (!canTransition(from, to)) {
    throw new DomainError(
      `Transición de contrato no permitida: ${LEASE_STATUS_LABELS[from]} → ${LEASE_STATUS_LABELS[to]}.`,
    );
  }
}

export function validateLease(input: LeaseInput): ValidatedLease {
  if (!input.propertyId) throw new DomainError('Debe seleccionar un inmueble.');
  if (!input.tenantId) throw new DomainError('Debe seleccionar un arrendatario.');

  const baseAmount = Number(input.baseAmount);
  if (Number.isNaN(baseAmount) || baseAmount <= 0) {
    throw new DomainError('El monto base debe ser mayor que cero.');
  }

  const dueDay = Number(input.dueDay);
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    throw new DomainError('El día de vencimiento debe estar entre 1 y 31.');
  }

  const adjustmentType = input.adjustmentType ?? 'NONE';

  // Spec §6: IPC accumulated applies only to CLP contracts.
  if (adjustmentType === 'IPC' && input.currency !== 'CLP') {
    throw new DomainError('El reajuste por IPC solo aplica a contratos en pesos (CLP).');
  }

  let adjustmentPeriodMonths: number | null = null;
  if (adjustmentType !== 'NONE') {
    const months = Number(input.adjustmentPeriodMonths);
    if (!Number.isInteger(months) || months <= 0) {
      throw new DomainError('El período de reajuste (meses) debe ser un entero positivo.');
    }
    adjustmentPeriodMonths = months;
  }

  if (!input.startDate || Number.isNaN(input.startDate.getTime())) {
    throw new DomainError('La fecha de inicio es obligatoria.');
  }
  if (input.endDate && input.endDate.getTime() <= input.startDate.getTime()) {
    throw new DomainError('La fecha de término debe ser posterior a la de inicio.');
  }

  let depositAmount: string | null = null;
  if (input.depositAmount !== null && input.depositAmount !== undefined && input.depositAmount !== '') {
    const deposit = Number(input.depositAmount);
    if (Number.isNaN(deposit) || deposit < 0) {
      throw new DomainError('La garantía debe ser un monto válido.');
    }
    depositAmount = deposit.toFixed(2);
  }

  return {
    propertyId: input.propertyId,
    tenantId: input.tenantId,
    baseAmount: baseAmount.toFixed(2),
    currency: input.currency,
    dueDay,
    adjustmentType,
    adjustmentPeriodMonths,
    nextAdjustment: input.nextAdjustment ?? null,
    depositAmount,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
  };
}
