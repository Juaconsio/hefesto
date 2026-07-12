import Link from 'next/link';
import { propertyService } from '@/modules/properties/services/property.service';
import { PROPERTY_TYPE_LABELS, TENURE_LABELS } from '@/modules/properties/domain/property';
import { PropertyStatusBadge } from '@/components/badges';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
  const properties = await propertyService.list();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Inmuebles</h1>
          <div className="subtitle">La columna vertebral: propios y administrados.</div>
        </div>
        <Link href="/properties/new" className="btn">
          Nuevo inmueble
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="empty">Aún no hay inmuebles. Crea el primero.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Alias</th>
              <th>Dirección</th>
              <th>Tipo</th>
              <th>Tenencia</th>
              <th>Propietario</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/properties/${p.id}`}>{p.alias}</Link>
                </td>
                <td>
                  {p.address}, {p.comuna}
                </td>
                <td>{PROPERTY_TYPE_LABELS[p.type]}</td>
                <td>
                  {TENURE_LABELS[p.tenure]}
                  {p.tenure === 'MANAGED' && p.commissionPct != null
                    ? ` · ${p.commissionPct.toString()}%`
                    : ''}
                </td>
                <td>{p.owner.name}</td>
                <td>
                  <PropertyStatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
