import Link from 'next/link';
import { LeaseForm } from '../LeaseForm';
import { createLease } from '../actions';
import { propertyService } from '@/modules/properties/services/property.service';
import { tenantService } from '@/modules/leasing/services/tenant.service';

export const dynamic = 'force-dynamic';

export default async function NewLeasePage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const { propertyId } = await searchParams;
  const [properties, tenants] = await Promise.all([propertyService.list(), tenantService.list()]);

  const missing = properties.length === 0 || tenants.length === 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Nuevo contrato</h1>
        </div>
      </div>
      {missing ? (
        <div className="empty">
          Necesitas al menos un <Link href="/properties/new">inmueble</Link> y un{' '}
          <Link href="/tenants/new">arrendatario</Link> para crear un contrato.
        </div>
      ) : (
        <div className="card">
          <LeaseForm
            action={createLease}
            properties={properties.map((p) => ({ id: p.id, alias: p.alias }))}
            tenants={tenants.map((t) => ({ id: t.id, name: t.name }))}
            defaultPropertyId={propertyId}
          />
        </div>
      )}
    </>
  );
}
