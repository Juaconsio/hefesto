import type { PropertyStatus, LeaseStatus, UtilityStatus } from '@prisma/client';
import { PROPERTY_STATUS_LABELS } from '@/modules/properties/domain/property';
import { LEASE_STATUS_LABELS } from '@/modules/leasing/domain/lease';
import { UTILITY_STATUS_LABELS } from '@/modules/utilities/domain/utility';
import {
  MOROSIDAD_STATUS_LABELS,
  type MorosidadStatus,
} from '@/modules/billing/services/billing.service';

const PROPERTY_STATUS_CLASS: Record<PropertyStatus, string> = {
  AVAILABLE: 'badge-gray',
  RENTED: 'badge-green',
  UNDER_REPAIR: 'badge-yellow',
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <span className={`badge ${PROPERTY_STATUS_CLASS[status]}`}>{PROPERTY_STATUS_LABELS[status]}</span>;
}

const LEASE_STATUS_CLASS: Record<LeaseStatus, string> = {
  DRAFT: 'badge-gray',
  ACTIVE: 'badge-green',
  TERMINATED: 'badge-red',
};

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  return <span className={`badge ${LEASE_STATUS_CLASS[status]}`}>{LEASE_STATUS_LABELS[status]}</span>;
}

const MOROSIDAD_STATUS_CLASS: Record<MorosidadStatus, string> = {
  AL_DIA: 'badge-green',
  ATRASADO: 'badge-yellow',
  MOROSO: 'badge-red',
};

export function MorosidadBadge({ status }: { status: MorosidadStatus }) {
  return (
    <span className={`badge ${MOROSIDAD_STATUS_CLASS[status]}`}>
      {MOROSIDAD_STATUS_LABELS[status]}
    </span>
  );
}

const UTILITY_STATUS_CLASS: Record<UtilityStatus, string> = {
  CURRENT: 'badge-green',
  PENDING: 'badge-yellow',
  OVERDUE: 'badge-red',
};

export function UtilityStatusBadge({ status }: { status: UtilityStatus }) {
  return (
    <span className={`badge ${UTILITY_STATUS_CLASS[status]}`}>{UTILITY_STATUS_LABELS[status]}</span>
  );
}
