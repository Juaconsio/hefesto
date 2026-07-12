'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ownerService } from '@/modules/leasing/services/owner.service';
import { toErrorMessage } from '@/lib/errors';
import { optionalString, requiredString, type FormState } from '@/lib/form';

function parse(formData: FormData) {
  return {
    name: requiredString(formData.get('name')),
    rut: requiredString(formData.get('rut')),
    email: optionalString(formData.get('email')),
    phone: optionalString(formData.get('phone')),
    isAdmin: formData.get('isAdmin') === 'on',
  };
}

export async function createOwner(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await ownerService.create(parse(formData));
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/owners');
  redirect('/owners');
}

export async function updateOwner(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await ownerService.update(id, parse(formData));
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/owners');
  redirect('/owners');
}
