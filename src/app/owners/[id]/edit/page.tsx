import { notFound } from 'next/navigation';
import { OwnerForm } from '../../OwnerForm';
import { updateOwner } from '../../actions';
import { ownerService } from '@/modules/leasing/services/owner.service';

export default async function EditOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await ownerService.getById(id);
  if (!owner) notFound();

  const action = updateOwner.bind(null, id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Editar propietario</h1>
        </div>
      </div>
      <div className="card">
        <OwnerForm action={action} owner={owner} />
      </div>
    </>
  );
}
