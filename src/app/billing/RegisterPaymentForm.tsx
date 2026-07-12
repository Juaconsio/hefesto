'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState } from '@/lib/form';
import { registerPayment } from './actions';

export function RegisterPaymentForm({
  leaseId,
  chargeId,
  defaultAmount,
}: {
  leaseId: string;
  chargeId?: string;
  defaultAmount: string;
}) {
  const [state, formAction] = useActionState(registerPayment, emptyFormState);

  return (
    <details>
      <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>Registrar pago</summary>
      <form action={formAction} className="entity-form" style={{ marginTop: 12, maxWidth: 420 }}>
        {state.error && <div className="form-error">{state.error}</div>}
        {state.message && <div className="muted">{state.message}</div>}
        <input type="hidden" name="leaseId" value={leaseId} />
        {chargeId && <input type="hidden" name="chargeId" value={chargeId} />}
        <div className="field-row">
          <div className="field">
            <label>Monto (CLP)</label>
            <input name="amount" type="number" step="1" min="0" defaultValue={defaultAmount} required />
          </div>
          <div className="field">
            <label>Fecha de pago</label>
            <input name="paidAt" type="date" />
          </div>
        </div>
        <div className="field">
          <label>Comprobante (URL)</label>
          <input name="receiptUrl" placeholder="https://… (opcional)" />
          <span className="hint">La subida de archivos a R2 llega en un incremento posterior.</span>
        </div>
        <div className="form-actions">
          <SubmitButton>Registrar pago</SubmitButton>
        </div>
      </form>
    </details>
  );
}
