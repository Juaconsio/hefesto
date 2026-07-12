import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LeaseForm } from '../../LeaseForm';
import { updateLease } from '../../actions';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { propertyService } from '@/modules/properties/services/property.service';
import { tenantService } from '@/modules/leasing/services/tenant.service';

export const dynamic = 'force-dynamic';

export default async function EditLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lease, properties, tenants] = await Promise.all([
    leaseService.getById(id),
    propertyService.list(),
    tenantService.list(),
  ]);
  if (!lease) notFound();

  if (lease.status !== 'DRAFT') {
    return (
      <>
        <div className="page-header">
          <h1>Editar contrato</h1>
        </div>
        <div className="empty">
          Solo se pueden editar contratos en borrador.{' '}
          <Link href={`/leases/${id}`}>Volver al contrato</Link>.
        </div>
      </>
    );
  }

  const action = updateLease.bind(null, id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Editar contrato</h1>
        </div>
      </div>
      <div className="card">
        <LeaseForm
          action={action}
          lease={lease}
          properties={properties.map((p) => ({ id: p.id, alias: p.alias }))}
          tenants={tenants.map((t) => ({ id: t.id, name: t.name }))}
        />
      </div>
    </>
  );
}
