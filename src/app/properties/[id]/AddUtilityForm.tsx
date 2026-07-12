'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState, type FormState } from '@/lib/form';
import {
  UTILITY_TYPE_LABELS,
  UTILITY_PAYER_LABELS,
  UTILITY_STATUS_LABELS,
} from '@/modules/utilities/domain/utility';

export function AddUtilityForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);
  return (
    <details style={{ marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>Agregar cuenta</summary>
      <form action={formAction} className="entity-form" style={{ marginTop: 12 }}>
        {state.error && <div className="form-error">{state.error}</div>}
        {state.message && <div className="muted">{state.message}</div>}
        <div className="field-row">
          <div className="field">
            <label>Tipo</label>
            <select name="type" defaultValue="ELECTRICITY">
              {Object.entries(UTILITY_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Paga</label>
            <select name="payer" defaultValue="TENANT">
              {Object.entries(UTILITY_PAYER_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Estado</label>
            <select name="status" defaultValue="CURRENT">
              {Object.entries(UTILITY_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Monto actual (CLP)</label>
            <input name="currentAmount" type="number" step="1" min="0" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Proveedor</label>
            <input name="provider" placeholder="Enel, Aguas Andinas…" />
          </div>
          <div className="field">
            <label>N° de cuenta</label>
            <input name="accountNumber" />
          </div>
        </div>
        <div className="form-actions">
          <SubmitButton>Agregar cuenta</SubmitButton>
        </div>
      </form>
    </details>
  );
}
