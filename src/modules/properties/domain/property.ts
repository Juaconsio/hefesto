import { DomainError } from '@/lib/errors';
import type { PropertyType, Tenure, PropertyStatus } from '@prisma/client';

// Pure domain: Property business rules. No Prisma, no HTTP.
// Key rule (spec §5): the owned/managed distinction lives in `tenure`.
// `commissionPct` applies ONLY when tenure = MANAGED.

export interface PropertyInput {
  ownerId: string;
  alias: string;
  address: string;
  comuna: string;
  siiRol?: string | null;
  type: PropertyType;
  tenure: Tenure;
  status?: PropertyStatus;
  dfl2?: boolean;
  commissionPct?: number | string | null;
}

export interface ValidatedProperty {
  ownerId: string;
  alias: string;
  address: string;
  comuna: string;
  siiRol: string | null;
  type: PropertyType;
  tenure: Tenure;
  status: PropertyStatus;
  dfl2: boolean;
  commissionPct: string | null;
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: 'Disponible',
  RENTED: 'Arrendado',
  UNDER_REPAIR: 'En reparación',
};

export const TENURE_LABELS: Record<Tenure, string> = {
  OWNED: 'Propio',
  MANAGED: 'Administrado',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOUSE: 'Casa',
  APARTMENT: 'Departamento',
};

/**
 * Validate and normalize property input, enforcing the tenure/commission rule.
 * Throws DomainError with a user-facing (Spanish) message on violation.
 */
export function validateProperty(input: PropertyInput): ValidatedProperty {
  const alias = input.alias?.trim();
  const address = input.address?.trim();
  const comuna = input.comuna?.trim();

  if (!alias) throw new DomainError('El alias es obligatorio.');
  if (!address) throw new DomainError('La dirección es obligatoria.');
  if (!comuna) throw new DomainError('La comuna es obligatoria.');
  if (!input.ownerId) throw new DomainError('Debe seleccionar un propietario.');

  let commissionPct: string | null = null;
  if (input.tenure === 'MANAGED') {
    if (input.commissionPct === null || input.commissionPct === undefined || input.commissionPct === '') {
      throw new DomainError('La comisión (%) es obligatoria para inmuebles administrados.');
    }
    const pct = Number(input.commissionPct);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      throw new DomainError('La comisión debe ser un porcentaje entre 0 y 100.');
    }
    commissionPct = pct.toFixed(2);
  } else {
    // OWNED: commission is meaningless and must not be stored.
    if (input.commissionPct !== null && input.commissionPct !== undefined && input.commissionPct !== '') {
      throw new DomainError('Un inmueble propio no lleva comisión.');
    }
  }

  return {
    ownerId: input.ownerId,
    alias,
    address,
    comuna,
    siiRol: input.siiRol?.trim() || null,
    type: input.type,
    tenure: input.tenure,
    status: input.status ?? 'AVAILABLE',
    dfl2: input.dfl2 ?? false,
    commissionPct,
  };
}
