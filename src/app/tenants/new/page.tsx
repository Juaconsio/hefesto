import { TenantForm } from '../TenantForm';
import { createTenant } from '../actions';

export default function NewTenantPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>Nuevo arrendatario</h1>
        </div>
      </div>
      <div className="card">
        <TenantForm action={createTenant} />
      </div>
    </>
  );
}
