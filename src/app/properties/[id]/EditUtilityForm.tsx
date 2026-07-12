'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState, type FormState } from '@/lib/form';
import {
  UTILITY_TYPE_LABELS,
  UTILITY_PAYER_LABELS,
  UTILITY_STATUS_LABELS,
} from '@/modules/utilities/domain/utility';
import type { UtilityAccount } from '@prisma/client';

export function EditUtilityForm({
  action,
  utility,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  utility: UtilityAccount;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);
  return (
    <details>
      <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>Editar</summary>
      <form action={formAction} className="entity-form" style={{ marginTop: 12, maxWidth: 460 }}>
        {state.error && <div className="form-error">{state.error}</div>}
        {state.message && <div className="muted">{state.message}</div>}
        <div className="field-row">
          <div className="field">
            <label>Tipo</label>
            <select name="type" defaultValue={utility.type}>
              {Object.entries(UTILITY_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Paga</label>
            <select name="payer" defaultValue={utility.payer}>
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
            <select name="status" defaultValue={utility.status}>
              {Object.entries(UTILITY_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Monto actual (CLP)</label>
            <input
              name="currentAmount"
              type="number"
              step="1"
              min="0"
              defaultValue={utility.currentAmount?.toString() ?? ''}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Proveedor</label>
            <input name="provider" defaultValue={utility.provider ?? ''} />
          </div>
          <div className="field">
            <label>N° de cuenta</label>
            <input name="accountNumber" defaultValue={utility.accountNumber ?? ''} />
          </div>
        </div>
        <div className="form-actions">
          <SubmitButton>Guardar</SubmitButton>
        </div>
      </form>
    </details>
  );
}
