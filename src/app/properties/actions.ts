'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { propertyService } from '@/modules/properties/services/property.service';
import { toErrorMessage } from '@/lib/errors';
import { optionalString, requiredString, type FormState } from '@/lib/form';
import type { PropertyType, Tenure, PropertyStatus } from '@prisma/client';

function parse(formData: FormData) {
  return {
    ownerId: requiredString(formData.get('ownerId')),
    alias: requiredString(formData.get('alias')),
    address: requiredString(formData.get('address')),
    comuna: requiredString(formData.get('comuna')),
    siiRol: optionalString(formData.get('siiRol')),
    type: requiredString(formData.get('type')) as PropertyType,
    tenure: requiredString(formData.get('tenure')) as Tenure,
    status: requiredString(formData.get('status')) as PropertyStatus,
    dfl2: formData.get('dfl2') === 'on',
    commissionPct: optionalString(formData.get('commissionPct')),
  };
}

export async function createProperty(_prev: FormState, formData: FormData): Promise<FormState> {
  let id: string;
  try {
    const created = await propertyService.create(parse(formData));
    id = created.id;
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/properties');
  redirect(`/properties/${id}`);
}

export async function updateProperty(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await propertyService.update(id, parse(formData));
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
  revalidatePath('/properties');
  revalidatePath(`/properties/${id}`);
  redirect(`/properties/${id}`);
}
