'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState, type FormState } from '@/lib/form';
import {
  PROPERTY_TYPE_LABELS,
  TENURE_LABELS,
  PROPERTY_STATUS_LABELS,
} from '@/modules/properties/domain/property';
import type { Property, Tenure } from '@prisma/client';

type OwnerOption = { id: string; name: string; isAdmin: boolean };

export function PropertyForm({
  action,
  owners,
  property,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  owners: OwnerOption[];
  property?: Property;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);
  const [tenure, setTenure] = useState<Tenure>(property?.tenure ?? 'OWNED');

  return (
    <form action={formAction} className="entity-form">
      {state.error && <div className="form-error">{state.error}</div>}

      <div className="field">
        <label htmlFor="ownerId">Propietario</label>
        <select id="ownerId" name="ownerId" defaultValue={property?.ownerId ?? ''} required>
          <option value="" disabled>
            Seleccionar…
          </option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
              {o.isAdmin ? ' (administradora)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="alias">Alias</label>
        <input id="alias" name="alias" defaultValue={property?.alias ?? ''} placeholder="Depto Ñuñoa" required />
      </div>

      <div className="field">
        <label htmlFor="address">Dirección</label>
        <input id="address" name="address" defaultValue={property?.address ?? ''} required />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="comuna">Comuna</label>
          <input id="comuna" name="comuna" defaultValue={property?.comuna ?? ''} required />
        </div>
        <div className="field">
          <label htmlFor="siiRol">Rol SII</label>
          <input id="siiRol" name="siiRol" defaultValue={property?.siiRol ?? ''} placeholder="12345-6" />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" defaultValue={property?.type ?? 'APARTMENT'}>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Estado</label>
          <select id="status" name="status" defaultValue={property?.status ?? 'AVAILABLE'}>
            {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="tenure">Tenencia</label>
          <select
            id="tenure"
            name="tenure"
            value={tenure}
            onChange={(e) => setTenure(e.target.value as Tenure)}
          >
            {Object.entries(TENURE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {tenure === 'MANAGED' && (
          <div className="field">
            <label htmlFor="commissionPct">Comisión (%)</label>
            <input
              id="commissionPct"
              name="commissionPct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={property?.commissionPct?.toString() ?? ''}
            />
            <span className="hint">Solo para inmuebles administrados.</span>
          </div>
        )}
      </div>

      <div className="checkbox-field">
        <input id="dfl2" name="dfl2" type="checkbox" defaultChecked={property?.dfl2 ?? false} />
        <label htmlFor="dfl2">Acogido a DFL2 (exención impuesto a la renta)</label>
      </div>

      <div className="form-actions">
        <SubmitButton>{property ? 'Guardar cambios' : 'Crear inmueble'}</SubmitButton>
        <Link href="/properties" className="btn btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
