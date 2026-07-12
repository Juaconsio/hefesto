import { OwnerForm } from '../OwnerForm';
import { createOwner } from '../actions';

export default function NewOwnerPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>Nuevo propietario</h1>
        </div>
      </div>
      <div className="card">
        <OwnerForm action={createOwner} />
      </div>
    </>
  );
}
