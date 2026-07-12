'use server';

import { revalidatePath } from 'next/cache';
import { billingService } from '@/modules/billing/services/billing.service';
import { paymentService } from '@/modules/billing/services/payment.service';
import { toErrorMessage } from '@/lib/errors';
import { optionalString, requiredString, type FormState } from '@/lib/form';
import { parseDateInput } from '@/lib/date';

export async function generateCharges(_prev: FormState, formData: FormData): Promise<FormState> {
  const period = requiredString(formData.get('period'));
  try {
    const result = await billingService.generateMonthlyCharges(period);
    revalidatePath('/billing');
    revalidatePath('/');
    return { message: `${result.created} cargo(s) generados, ${result.skipped} ya existían.` };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

export async function registerPayment(_prev: FormState, formData: FormData): Promise<FormState> {
  const paidAtRaw = optionalString(formData.get('paidAt'));
  try {
    await paymentService.registerManualPayment({
      leaseId: requiredString(formData.get('leaseId')),
      chargeId: optionalString(formData.get('chargeId')),
      amount: requiredString(formData.get('amount')),
      paidAt: paidAtRaw ? parseDateInput(paidAtRaw) : null,
      receiptUrl: optionalString(formData.get('receiptUrl')),
    });
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/billing');
  revalidatePath('/');
  const leaseId = requiredString(formData.get('leaseId'));
  revalidatePath(`/leases/${leaseId}`);
  return { message: 'Pago registrado.' };
}
