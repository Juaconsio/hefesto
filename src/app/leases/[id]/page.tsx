import Link from 'next/link';
import { notFound } from 'next/navigation';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { activateLease, terminateLease } from '../actions';
import { LeaseStatusBadge } from '@/components/badges';
import {
  CURRENCY_LABELS,
  ADJUSTMENT_TYPE_LABELS,
} from '@/modules/leasing/domain/lease';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { formatRut } from '@/lib/rut';

export const dynamic = 'force-dynamic';

export default async function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lease = await leaseService.getById(id);
  if (!lease) notFound();

  const activate = activateLease.bind(null, id);
  const terminate = terminateLease.bind(null, id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Contrato · {lease.property.alias}</h1>
          <div className="subtitle">
            <LeaseStatusBadge status={lease.status} /> · arrendatario {lease.tenant.name}
          </div>
        </div>
        <div className="inline-actions">
          {lease.status === 'DRAFT' && (
            <>
              <Link href={`/leases/${lease.id}/edit`} className="btn btn-secondary">
                Editar
              </Link>
              <form action={activate}>
                <button type="submit" className="btn">
                  Activar contrato
                </button>
              </form>
            </>
          )}
          {lease.status === 'ACTIVE' && (
            <form action={terminate}>
              <button type="submit" className="btn btn-danger">
                Terminar contrato
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Detalle</h2>
        <dl className="dl">
          <dt>Inmueble</dt>
          <dd>
            <Link href={`/properties/${lease.propertyId}`}>{lease.property.alias}</Link> —{' '}
            {lease.property.address}, {lease.property.comuna}
          </dd>
          <dt>Arrendatario</dt>
          <dd>
            {lease.tenant.name} ({formatRut(lease.tenant.rut)})
          </dd>
          <dt>Monto base</dt>
          <dd>{formatMoney(lease.baseAmount.toString(), lease.currency)}</dd>
          <dt>Moneda</dt>
          <dd>{CURRENCY_LABELS[lease.currency]}</dd>
          <dt>Vence día</dt>
          <dd>{lease.dueDay} de cada mes</dd>
          <dt>Reajuste</dt>
          <dd>
            {ADJUSTMENT_TYPE_LABELS[lease.adjustmentType]}
            {lease.adjustmentPeriodMonths ? ` · cada ${lease.adjustmentPeriodMonths} meses` : ''}
          </dd>
          <dt>Garantía</dt>
          <dd>
            {lease.depositAmount != null
              ? formatMoney(lease.depositAmount.toString(), lease.currency)
              : '—'}
          </dd>
          <dt>Inicio</dt>
          <dd>{formatDate(lease.startDate)}</dd>
          <dt>Término</dt>
          <dd>{formatDate(lease.endDate)}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Cargos y pagos</h2>
        <p className="muted">
          La cobranza mensual y el registro de pagos llegan en el próximo incremento (billing).
        </p>
      </div>
    </>
  );
}
