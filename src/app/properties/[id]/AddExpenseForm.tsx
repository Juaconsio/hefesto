'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState, type FormState } from '@/lib/form';
import { EXPENSE_CATEGORY_LABELS } from '@/modules/expenses/domain/expense';

export function AddExpenseForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);
  return (
    <details style={{ marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>Registrar gasto</summary>
      <form action={formAction} className="entity-form" style={{ marginTop: 12 }}>
        {state.error && <div className="form-error">{state.error}</div>}
        {state.message && <div className="muted">{state.message}</div>}
        <div className="field-row">
          <div className="field">
            <label>Categoría</label>
            <select name="category" defaultValue="MAINTENANCE">
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Fecha</label>
            <input name="date" type="date" required />
          </div>
        </div>
        <div className="field">
          <label>Descripción</label>
          <input name="description" required />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Monto (CLP)</label>
            <input name="amount" type="number" step="1" min="0" required />
          </div>
          <div className="checkbox-field" style={{ alignSelf: 'end' }}>
            <input id="billableToOwner" name="billableToOwner" type="checkbox" />
            <label htmlFor="billableToOwner">Imputable al propietario</label>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Comprobante (URL)</label>
            <input name="receiptUrl" placeholder="https://… (boleta/factura)" />
          </div>
          <div className="field">
            <label>Foto (URL)</label>
            <input name="photoUrl" placeholder="https://… (respaldo)" />
          </div>
        </div>
        <span className="hint">
          Un gasto imputado al propietario requiere respaldo (comprobante o foto). La subida a R2
          llega después; por ahora se pega la URL.
        </span>
        <div className="form-actions">
          <SubmitButton>Registrar gasto</SubmitButton>
        </div>
      </form>
    </details>
  );
}
