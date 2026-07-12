import Link from 'next/link';
import { notFound } from 'next/navigation';
import { propertyService } from '@/modules/properties/services/property.service';
import {
  PROPERTY_TYPE_LABELS,
  TENURE_LABELS,
} from '@/modules/properties/domain/property';
import { LEASE_STATUS_LABELS } from '@/modules/leasing/domain/lease';
import { PropertyStatusBadge, LeaseStatusBadge } from '@/components/badges';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { formatRut } from '@/lib/rut';

export const dynamic = 'force-dynamic';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await propertyService.getById(id);
  if (!property) notFound();

  const activeLease = property.leases.find((l) => l.status === 'ACTIVE');

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{property.alias}</h1>
          <div className="subtitle">
            {property.address}, {property.comuna} · <PropertyStatusBadge status={property.status} />
          </div>
        </div>
        <div className="inline-actions">
          <Link href={`/properties/${property.id}/edit`} className="btn btn-secondary">
            Editar
          </Link>
          <Link href={`/leases/new?propertyId=${property.id}`} className="btn">
            Nuevo contrato
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Datos del inmueble</h2>
        <dl className="dl">
          <dt>Propietario</dt>
          <dd>
            {property.owner.name} ({formatRut(property.owner.rut)}){' '}
            {property.owner.isAdmin && <span className="badge badge-green">Administradora</span>}
          </dd>
          <dt>Tipo</dt>
          <dd>{PROPERTY_TYPE_LABELS[property.type]}</dd>
          <dt>Tenencia</dt>
          <dd>
            {TENURE_LABELS[property.tenure]}
            {property.tenure === 'MANAGED' && property.commissionPct != null
              ? ` · comisión ${property.commissionPct.toString()}%`
              : ''}
          </dd>
          <dt>Rol SII</dt>
          <dd>{property.siiRol ?? '—'}</dd>
          <dt>DFL2</dt>
          <dd>{property.dfl2 ? 'Sí' : 'No'}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Contrato vigente</h2>
        {activeLease ? (
          <dl className="dl">
            <dt>Arrendatario</dt>
            <dd>
              <Link href={`/leases/${activeLease.id}`}>{activeLease.tenant.name}</Link>
            </dd>
            <dt>Monto</dt>
            <dd>{formatMoney(activeLease.baseAmount.toString(), activeLease.currency)}</dd>
            <dt>Vence día</dt>
            <dd>{activeLease.dueDay} de cada mes</dd>
            <dt>Inicio</dt>
            <dd>{formatDate(activeLease.startDate)}</dd>
            <dt>Estado</dt>
            <dd>
              <LeaseStatusBadge status={activeLease.status} />
            </dd>
          </dl>
        ) : (
          <p className="muted">
            Sin contrato vigente.{' '}
            <Link href={`/leases/new?propertyId=${property.id}`}>Crear uno</Link>.
          </p>
        )}
      </div>

      {property.leases.length > 0 && (
        <div className="card">
          <h2>Historial de contratos</h2>
          <table>
            <thead>
              <tr>
                <th>Arrendatario</th>
                <th>Monto</th>
                <th>Inicio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {property.leases.map((l) => (
                <tr key={l.id}>
                  <td>{l.tenant.name}</td>
                  <td>{formatMoney(l.baseAmount.toString(), l.currency)}</td>
                  <td>{formatDate(l.startDate)}</td>
                  <td>{LEASE_STATUS_LABELS[l.status]}</td>
                  <td>
                    <Link href={`/leases/${l.id}`}>Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h2>Cuentas de servicio</h2>
        <p className="muted">Disponible en el próximo incremento (utilities).</p>
      </div>

      <div className="card">
        <h2>Gastos</h2>
        <p className="muted">Disponible en el próximo incremento (expenses).</p>
      </div>
    </>
  );
}
