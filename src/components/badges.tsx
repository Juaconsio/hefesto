import type { PropertyStatus, LeaseStatus } from '@prisma/client';
import { PROPERTY_STATUS_LABELS } from '@/modules/properties/domain/property';
import { LEASE_STATUS_LABELS } from '@/modules/leasing/domain/lease';

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
