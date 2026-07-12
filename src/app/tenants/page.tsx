import Link from 'next/link';
import { tenantService } from '@/modules/leasing/services/tenant.service';
import { formatRut } from '@/lib/rut';

export const dynamic = 'force-dynamic';

export default async function TenantsPage() {
  const tenants = await tenantService.list();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Arrendatarios</h1>
          <div className="subtitle">Quienes arriendan los inmuebles.</div>
        </div>
        <Link href="/tenants/new" className="btn">
          Nuevo arrendatario
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="empty">Aún no hay arrendatarios. Crea el primero.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{formatRut(t.rut)}</td>
                <td>{t.email ?? '—'}</td>
                <td>{t.phone ?? '—'}</td>
                <td>
                  <Link href={`/tenants/${t.id}/edit`}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
