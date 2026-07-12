import Link from 'next/link';
import { propertyService } from '@/modules/properties/services/property.service';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { PropertyStatusBadge } from '@/components/badges';
import { PROPERTY_STATUS_LABELS, TENURE_LABELS } from '@/modules/properties/domain/property';
import type { PropertyStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [properties, leases] = await Promise.all([propertyService.list(), leaseService.list()]);

  const byStatus = (status: PropertyStatus) => properties.filter((p) => p.status === status).length;
  const activeLeases = leases.filter((l) => l.status === 'ACTIVE').length;
  const managed = properties.filter((p) => p.tenure === 'MANAGED').length;
  const owned = properties.filter((p) => p.tenure === 'OWNED').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Panel</h1>
          <div className="subtitle">¿Qué está al día y qué no?</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="value">{properties.length}</div>
          <div className="label">
            Inmuebles · {owned} {TENURE_LABELS.OWNED.toLowerCase()} / {managed}{' '}
            {TENURE_LABELS.MANAGED.toLowerCase()}
          </div>
        </div>
        <div className="stat">
          <div className="value">{activeLeases}</div>
          <div className="label">Contratos vigentes</div>
        </div>
        <div className="stat">
          <div className="value">{byStatus('AVAILABLE')}</div>
          <div className="label">{PROPERTY_STATUS_LABELS.AVAILABLE}</div>
        </div>
        <div className="stat">
          <div className="value">{byStatus('UNDER_REPAIR')}</div>
          <div className="label">{PROPERTY_STATUS_LABELS.UNDER_REPAIR}</div>
        </div>
      </div>

      <div className="card">
        <h2>Inmuebles por estado</h2>
        {properties.length === 0 ? (
          <p className="muted">
            Aún no hay inmuebles. <Link href="/properties/new">Crea el primero</Link>.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Alias</th>
                <th>Tenencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/properties/${p.id}`}>{p.alias}</Link>
                  </td>
                  <td>{TENURE_LABELS[p.tenure]}</td>
                  <td>
                    <PropertyStatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Morosidad</h2>
        <p className="muted">
          El panel de morosidad y próximos vencimientos llega con el módulo de cobranza (billing) en
          el próximo incremento.
        </p>
      </div>
    </>
  );
}
