import { DomainError } from '@/lib/errors';
import { isValidRut, normalizeRut } from '@/lib/rut';

// Pure domain: Owner rules. An Owner is either the administrator (isAdmin) or a
// third-party mandante. RUT is validated via módulo-11 and stored normalized.

export interface OwnerInput {
  name: string;
  rut: string;
  email?: string | null;
  phone?: string | null;
  isAdmin?: boolean;
}

export interface ValidatedOwner {
  name: string;
  rut: string;
  email: string | null;
  phone: string | null;
  isAdmin: boolean;
}

export function validateOwner(input: OwnerInput): ValidatedOwner {
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
    isAdmin: input.isAdmin ?? false,
  };
}
