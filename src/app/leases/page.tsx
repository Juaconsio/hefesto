import Link from 'next/link';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { LeaseStatusBadge } from '@/components/badges';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';

export const dynamic = 'force-dynamic';

export default async function LeasesPage() {
  const leases = await leaseService.list();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Contratos</h1>
          <div className="subtitle">Contratos de arriendo por inmueble.</div>
        </div>
        <Link href="/leases/new" className="btn">
          Nuevo contrato
        </Link>
      </div>

      {leases.length === 0 ? (
        <div className="empty">Aún no hay contratos. Crea el primero.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Inmueble</th>
              <th>Arrendatario</th>
              <th>Monto</th>
              <th>Inicio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leases.map((l) => (
              <tr key={l.id}>
                <td>{l.property.alias}</td>
                <td>{l.tenant.name}</td>
                <td>{formatMoney(l.baseAmount.toString(), l.currency)}</td>
                <td>{formatDate(l.startDate)}</td>
                <td>
                  <LeaseStatusBadge status={l.status} />
                </td>
                <td>
                  <Link href={`/leases/${l.id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
