import { notFound } from 'next/navigation';
import { PropertyForm } from '../../PropertyForm';
import { updateProperty } from '../../actions';
import { propertyService } from '@/modules/properties/services/property.service';
import { ownerService } from '@/modules/leasing/services/owner.service';

export const dynamic = 'force-dynamic';

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, owners] = await Promise.all([propertyService.getById(id), ownerService.list()]);
  if (!property) notFound();

  const action = updateProperty.bind(null, id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Editar inmueble</h1>
        </div>
      </div>
      <div className="card">
        <PropertyForm action={action} owners={owners} property={property} />
      </div>
    </>
  );
}
