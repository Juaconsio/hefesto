'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState } from '@/lib/form';
import { generateCharges } from './actions';

export function GenerateChargesButton({ period }: { period: string }) {
  const [state, formAction] = useActionState(generateCharges, emptyFormState);
  return (
    <form action={formAction} className="inline-actions" style={{ alignItems: 'center' }}>
      <input type="hidden" name="period" value={period} />
      <SubmitButton>Generar cargos del mes</SubmitButton>
      {state.message && <span className="muted">{state.message}</span>}
      {state.error && <span style={{ color: 'var(--danger)' }}>{state.error}</span>}
    </form>
  );
}
