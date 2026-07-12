'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState, type FormState } from '@/lib/form';
import type { Tenant } from '@prisma/client';

export function TenantForm({
  action,
  tenant,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  tenant?: Tenant;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <form action={formAction} className="entity-form">
      {state.error && <div className="form-error">{state.error}</div>}

      <div className="field">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" defaultValue={tenant?.name ?? ''} required />
      </div>

      <div className="field">
        <label htmlFor="rut">RUT</label>
        <input id="rut" name="rut" defaultValue={tenant?.rut ?? ''} placeholder="12.345.678-9" required />
        <span className="hint">Se valida con módulo 11.</span>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={tenant?.email ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="phone">Teléfono</label>
          <input id="phone" name="phone" defaultValue={tenant?.phone ?? ''} />
        </div>
      </div>

      <div className="form-actions">
        <SubmitButton>{tenant ? 'Guardar cambios' : 'Crear arrendatario'}</SubmitButton>
        <Link href="/tenants" className="btn btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
