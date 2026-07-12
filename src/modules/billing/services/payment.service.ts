import { DomainError } from '@/lib/errors';
import { assertPaymentTransition, validatePaymentAmount } from '../domain/payment';
import { paymentRepository } from '../repositories/payment.repository';
import { chargeRepository } from '../repositories/charge.repository';
import { leaseService } from '@/modules/leasing/services/lease.service';

export interface RegisterPaymentInput {
  leaseId: string;
  chargeId?: string | null;
  amount: number | string;
  paidAt?: Date | null;
  receiptUrl?: string | null;
}

export const paymentService = {
  listByLease(leaseId: string) {
    return paymentRepository.listByLease(leaseId);
  },

  /**
   * Register a manual payment. In v0.1 the administrator confirms in the act, so the
   * payment is created directly CONFIRMED (only CONFIRMED counts for morosidad).
   */
  async registerManualPayment(input: RegisterPaymentInput) {
    const lease = await leaseService.getById(input.leaseId);
    if (!lease) throw new DomainError('El contrato no existe.');

    if (input.chargeId) {
      const charge = await chargeRepository.findById(input.chargeId);
      if (!charge || charge.leaseId !== input.leaseId) {
        throw new DomainError('El cargo indicado no pertenece a este contrato.');
      }
    }

    const amount = validatePaymentAmount(input.amount);
    return paymentRepository.create({
      leaseId: input.leaseId,
      chargeId: input.chargeId ?? null,
      amount,
      paidAt: input.paidAt ?? new Date(),
      status: 'CONFIRMED',
      receiptUrl: input.receiptUrl ?? null,
    });
  },

  /** PENDING -> CONFIRMED (kept for the future tenant portal / gateways). */
  async confirm(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new DomainError('El pago no existe.');
    assertPaymentTransition(payment.status, 'CONFIRMED');
    return paymentRepository.updateStatus(id, 'CONFIRMED');
  },

  /** PENDING -> FAILED. */
  async markFailed(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new DomainError('El pago no existe.');
    assertPaymentTransition(payment.status, 'FAILED');
    return paymentRepository.updateStatus(id, 'FAILED');
  },
};
