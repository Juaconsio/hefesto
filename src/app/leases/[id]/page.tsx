import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { activateLease, terminateLease } from '../actions';
import { LeaseStatusBadge } from '@/components/badges';
import {
  CURRENCY_LABELS,
  ADJUSTMENT_TYPE_LABELS,
} from '@/modules/leasing/domain/lease';
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/modules/billing/domain/payment';
import { formatMoney, formatClp } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { formatRut } from '@/lib/rut';

export const dynamic = 'force-dynamic';

export default async function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lease = await leaseService.getById(id);
  if (!lease) notFound();

  const activate = activateLease.bind(null, id);
  const terminate = terminateLease.bind(null, id);

  const charged = lease.charges.reduce((acc, c) => acc.plus(c.amountClp), new Prisma.Decimal(0));
  const paid = lease.payments
    .filter((p) => p.status === 'CONFIRMED')
    .reduce((acc, p) => acc.plus(p.amount), new Prisma.Decimal(0));
  const rawDebt = charged.minus(paid);
  const debt = rawDebt.isNegative() ? new Prisma.Decimal(0) : rawDebt;

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
        <dl className="dl" style={{ marginBottom: 16 }}>
          <dt>Total cobrado</dt>
          <dd>{formatClp(charged.toString())}</dd>
          <dt>Total pagado (confirmado)</dt>
          <dd>{formatClp(paid.toString())}</dd>
          <dt>Deuda</dt>
          <dd>
            {debt.lessThanOrEqualTo(0) ? (
              <span className="badge badge-green">Al día</span>
            ) : (
              formatClp(debt.toString())
            )}
          </dd>
        </dl>

        <h3 style={{ fontSize: 14, margin: '4px 0 8px' }}>Cargos</h3>
        {lease.charges.length === 0 ? (
          <p className="muted">
            Sin cargos. Genera los cargos del mes en <Link href="/billing">Cobranza</Link>.
          </p>
        ) : (
          <table style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Vence</th>
                <th>Monto</th>
                <th>UF usada</th>
              </tr>
            </thead>
            <tbody>
              {lease.charges.map((c) => (
                <tr key={c.id}>
                  <td>{c.period}</td>
                  <td>{formatDate(c.dueDate)}</td>
                  <td>{formatClp(c.amountClp.toString())}</td>
                  <td>{c.ufValue != null ? c.ufValue.toString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3 style={{ fontSize: 14, margin: '4px 0 8px' }}>Pagos</h3>
        {lease.payments.length === 0 ? (
          <p className="muted">Sin pagos registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lease.payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.paidAt)}</td>
                  <td>{formatClp(p.amount.toString())}</td>
                  <td>{PAYMENT_METHOD_LABELS[p.method]}</td>
                  <td>{PAYMENT_STATUS_LABELS[p.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
