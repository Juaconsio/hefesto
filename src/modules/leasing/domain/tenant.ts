import { DomainError } from '@/lib/errors';
import { isValidRut, normalizeRut } from '@/lib/rut';

// Pure domain: Tenant rules. RUT validated via módulo-11, stored normalized.

export interface TenantInput {
  name: string;
  rut: string;
  email?: string | null;
  phone?: string | null;
}

export interface ValidatedTenant {
  name: string;
  rut: string;
  email: string | null;
  phone: string | null;
}

export function validateTenant(input: TenantInput): ValidatedTenant {
  const name = input.name?.trim();
  if (!name) throw new DomainError('El nombre es obligatorio.');
  if (!input.rut || !isValidRut(input.rut)) {
    throw new DomainError('El RUT es inválido.');
  }
  return {
    name,
    rut: normalizeRut(input.rut),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
  };
}
