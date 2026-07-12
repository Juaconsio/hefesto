import Link from 'next/link';
import { PropertyForm } from '../PropertyForm';
import { createProperty } from '../actions';
import { ownerService } from '@/modules/leasing/services/owner.service';

export const dynamic = 'force-dynamic';

export default async function NewPropertyPage() {
  const owners = await ownerService.list();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Nuevo inmueble</h1>
        </div>
      </div>
      {owners.length === 0 ? (
        <div className="empty">
          Primero crea un <Link href="/owners/new">propietario</Link>.
        </div>
      ) : (
        <div className="card">
          <PropertyForm action={createProperty} owners={owners} />
        </div>
      )}
    </>
  );
}
