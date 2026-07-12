import Link from 'next/link';
import { ownerService } from '@/modules/leasing/services/owner.service';
import { formatRut } from '@/lib/rut';

export const dynamic = 'force-dynamic';

export default async function OwnersPage() {
  const owners = await ownerService.list();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Propietarios</h1>
          <div className="subtitle">Dueños de inmuebles: la administradora o mandantes.</div>
        </div>
        <Link href="/owners/new" className="btn">
          Nuevo propietario
        </Link>
      </div>

      {owners.length === 0 ? (
        <div className="empty">Aún no hay propietarios. Crea el primero.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o) => (
              <tr key={o.id}>
                <td>{o.name}</td>
                <td>{formatRut(o.rut)}</td>
                <td>{o.email ?? '—'}</td>
                <td>{o.phone ?? '—'}</td>
                <td>
                  {o.isAdmin ? (
                    <span className="badge badge-green">Administradora</span>
                  ) : (
                    <span className="badge badge-gray">Mandante</span>
                  )}
                </td>
                <td>
                  <Link href={`/owners/${o.id}/edit`}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
