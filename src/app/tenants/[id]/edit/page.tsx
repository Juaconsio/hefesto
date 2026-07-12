import { notFound } from 'next/navigation';
import { TenantForm } from '../../TenantForm';
import { updateTenant } from '../../actions';
import { tenantService } from '@/modules/leasing/services/tenant.service';

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await tenantService.getById(id);
  if (!tenant) notFound();

  const action = updateTenant.bind(null, id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Editar arrendatario</h1>
        </div>
      </div>
      <div className="card">
        <TenantForm action={action} tenant={tenant} />
      </div>
    </>
  );
}
