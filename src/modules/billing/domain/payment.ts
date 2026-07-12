import { DomainError } from '@/lib/errors';
import type { PaymentStatus, PaymentMethod } from '@prisma/client';

// Pure domain: Payment state machine + validation.
// Lifecycle: PENDING -> CONFIRMED -> FAILED. Only CONFIRMED counts for morosidad.
// In v0.1 the administrator registers a payment already CONFIRMED; the PENDING and
// FAILED transitions are kept for the future tenant portal / payment gateways.

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  FAILED: 'Fallido',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  MANUAL: 'Manual',
  KHIPU: 'Khipu',
  FINTOC: 'Fintoc',
};

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ['CONFIRMED', 'FAILED'],
  CONFIRMED: [],
  FAILED: [],
};

export function canPaymentTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return PAYMENT_TRANSITIONS[from].includes(to);
}

export function assertPaymentTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canPaymentTransition(from, to)) {
    throw new DomainError(
      `Transición de pago no permitida: ${PAYMENT_STATUS_LABELS[from]} → ${PAYMENT_STATUS_LABELS[to]}.`,
    );
  }
}

export function validatePaymentAmount(amount: number | string): string {
  const n = Number(amount);
  if (Number.isNaN(n) || n <= 0) {
    throw new DomainError('El monto del pago debe ser mayor que cero.');
  }
  return n.toFixed(2);
}
