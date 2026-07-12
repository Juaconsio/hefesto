'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { toErrorMessage } from '@/lib/errors';
import { optionalString, requiredString, type FormState } from '@/lib/form';
import { parseDateInput } from '@/lib/date';
import type { Currency, AdjustmentType } from '@prisma/client';

function parse(formData: FormData) {
  const endDateRaw = optionalString(formData.get('endDate'));
  const nextAdjRaw = optionalString(formData.get('nextAdjustment'));
  return {
    propertyId: requiredString(formData.get('propertyId')),
    tenantId: requiredString(formData.get('tenantId')),
    baseAmount: requiredString(formData.get('baseAmount')),
    currency: requiredString(formData.get('currency')) as Currency,
    dueDay: requiredString(formData.get('dueDay')),
    adjustmentType: requiredString(formData.get('adjustmentType')) as AdjustmentType,
    adjustmentPeriodMonths: optionalString(formData.get('adjustmentPeriodMonths')),
    nextAdjustment: nextAdjRaw ? parseDateInput(nextAdjRaw) : null,
    depositAmount: optionalString(formData.get('depositAmount')),
    startDate: parseDateInput(requiredString(formData.get('startDate'))),
    endDate: endDateRaw ? parseDateInput(endDateRaw) : null,
  };
}

export async function createLease(_prev: FormState, formData: FormData): Promise<FormState> {
  let id: string;
  try {
    const created = await leaseService.create(parse(formData));
    id = created.id;
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/leases');
  redirect(`/leases/${id}`);
}

export async function updateLease(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await leaseService.update(id, parse(formData));
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/leases');
  revalidatePath(`/leases/${id}`);
  redirect(`/leases/${id}`);
}

export async function activateLease(id: string): Promise<void> {
  await leaseService.activate(id);
  revalidatePath('/leases');
  revalidatePath(`/leases/${id}`);
  revalidatePath('/properties');
}

export async function terminateLease(id: string): Promise<void> {
  await leaseService.terminate(id);
  revalidatePath('/leases');
  revalidatePath(`/leases/${id}`);
  revalidatePath('/properties');
}
