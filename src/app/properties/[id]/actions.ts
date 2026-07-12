'use server';

import { revalidatePath } from 'next/cache';
import { utilityService } from '@/modules/utilities/services/utility.service';
import { expenseService } from '@/modules/expenses/services/expense.service';
import { toErrorMessage } from '@/lib/errors';
import { optionalString, requiredString, type FormState } from '@/lib/form';
import { parseDateInput } from '@/lib/date';
import type { UtilityType, UtilityPayer, UtilityStatus, ExpenseCategory } from '@prisma/client';

export async function addUtility(
  propertyId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await utilityService.create({
      propertyId,
      type: requiredString(formData.get('type')) as UtilityType,
      payer: requiredString(formData.get('payer')) as UtilityPayer,
      status: requiredString(formData.get('status')) as UtilityStatus,
      provider: optionalString(formData.get('provider')),
      accountNumber: optionalString(formData.get('accountNumber')),
      currentAmount: optionalString(formData.get('currentAmount')),
    });
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath(`/properties/${propertyId}`);
  return { message: 'Cuenta de servicio agregada.' };
}

export async function updateUtility(
  propertyId: string,
  utilityId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await utilityService.update(utilityId, {
      propertyId,
      type: requiredString(formData.get('type')) as UtilityType,
      payer: requiredString(formData.get('payer')) as UtilityPayer,
      status: requiredString(formData.get('status')) as UtilityStatus,
      provider: optionalString(formData.get('provider')),
      accountNumber: optionalString(formData.get('accountNumber')),
      currentAmount: optionalString(formData.get('currentAmount')),
    });
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath(`/properties/${propertyId}`);
  return { message: 'Cuenta actualizada.' };
}

export async function deleteUtility(propertyId: string, utilityId: string): Promise<void> {
  await utilityService.delete(utilityId);
  revalidatePath(`/properties/${propertyId}`);
}

export async function addExpense(
  propertyId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await expenseService.create({
      propertyId,
      category: requiredString(formData.get('category')) as ExpenseCategory,
      description: requiredString(formData.get('description')),
      amount: requiredString(formData.get('amount')),
      date: parseDateInput(requiredString(formData.get('date'))),
      billableToOwner: formData.get('billableToOwner') === 'on',
      receiptUrl: optionalString(formData.get('receiptUrl')),
      photoUrl: optionalString(formData.get('photoUrl')),
    });
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath(`/properties/${propertyId}`);
  return { message: 'Gasto registrado.' };
}

export async function deleteExpense(propertyId: string, expenseId: string): Promise<void> {
  await expenseService.delete(expenseId);
  revalidatePath(`/properties/${propertyId}`);
}
