'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState, type FormState } from '@/lib/form';
import type { Owner } from '@prisma/client';

export function OwnerForm({
  action,
  owner,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  owner?: Owner;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <form action={formAction} className="entity-form">
      {state.error && <div className="form-error">{state.error}</div>}

      <div className="field">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" defaultValue={owner?.name ?? ''} required />
      </div>

      <div className="field">
        <label htmlFor="rut">RUT</label>
        <input id="rut" name="rut" defaultValue={owner?.rut ?? ''} placeholder="12.345.678-9" required />
        <span className="hint">Se valida con módulo 11.</span>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={owner?.email ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="phone">Teléfono</label>
          <input id="phone" name="phone" defaultValue={owner?.phone ?? ''} />
        </div>
      </div>

      <div className="checkbox-field">
        <input id="isAdmin" name="isAdmin" type="checkbox" defaultChecked={owner?.isAdmin ?? false} />
        <label htmlFor="isAdmin">Es la administradora (sin comisión)</label>
      </div>

      <div className="form-actions">
        <SubmitButton>{owner ? 'Guardar cambios' : 'Crear propietario'}</SubmitButton>
        <Link href="/owners" className="btn btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
