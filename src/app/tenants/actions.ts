'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { tenantService } from '@/modules/leasing/services/tenant.service';
import { toErrorMessage } from '@/lib/errors';
import { optionalString, requiredString, type FormState } from '@/lib/form';

function parse(formData: FormData) {
  return {
    name: requiredString(formData.get('name')),
    rut: requiredString(formData.get('rut')),
    email: optionalString(formData.get('email')),
    phone: optionalString(formData.get('phone')),
  };
}

export async function createTenant(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await tenantService.create(parse(formData));
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/tenants');
  redirect('/tenants');
}

export async function updateTenant(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await tenantService.update(id, parse(formData));
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/tenants');
  redirect('/tenants');
}
