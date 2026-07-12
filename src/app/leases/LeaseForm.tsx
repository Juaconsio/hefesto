'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { SubmitButton } from '@/components/SubmitButton';
import { emptyFormState, type FormState } from '@/lib/form';
import { CURRENCY_LABELS, ADJUSTMENT_TYPE_LABELS } from '@/modules/leasing/domain/lease';
import { toDateInputValue } from '@/lib/date';
import type { Lease, AdjustmentType } from '@prisma/client';

type PropertyOption = { id: string; alias: string };
type TenantOption = { id: string; name: string };

export function LeaseForm({
  action,
  properties,
  tenants,
  lease,
  defaultPropertyId,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  properties: PropertyOption[];
  tenants: TenantOption[];
  lease?: Lease;
  defaultPropertyId?: string;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>(
    lease?.adjustmentType ?? 'NONE',
  );

  return (
    <form action={formAction} className="entity-form">
      {state.error && <div className="form-error">{state.error}</div>}

      <div className="field-row">
        <div className="field">
          <label htmlFor="propertyId">Inmueble</label>
          <select
            id="propertyId"
            name="propertyId"
            defaultValue={lease?.propertyId ?? defaultPropertyId ?? ''}
            required
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.alias}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tenantId">Arrendatario</label>
          <select id="tenantId" name="tenantId" defaultValue={lease?.tenantId ?? ''} required>
            <option value="" disabled>
              Seleccionar…
            </option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="baseAmount">Monto base</label>
          <input
            id="baseAmount"
            name="baseAmount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={lease?.baseAmount?.toString() ?? ''}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="currency">Moneda</label>
          <select id="currency" name="currency" defaultValue={lease?.currency ?? 'CLP'}>
            {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="dueDay">Día de vencimiento</label>
          <input
            id="dueDay"
            name="dueDay"
            type="number"
            min="1"
            max="31"
            defaultValue={lease?.dueDay?.toString() ?? '5'}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="depositAmount">Garantía (monto)</label>
          <input
            id="depositAmount"
            name="depositAmount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={lease?.depositAmount?.toString() ?? ''}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="adjustmentType">Reajuste</label>
          <select
            id="adjustmentType"
            name="adjustmentType"
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
          >
            {Object.entries(ADJUSTMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="hint">El reajuste por IPC solo aplica a contratos en CLP.</span>
        </div>
        {adjustmentType !== 'NONE' && (
          <div className="field">
            <label htmlFor="adjustmentPeriodMonths">Período de reajuste (meses)</label>
            <input
              id="adjustmentPeriodMonths"
              name="adjustmentPeriodMonths"
              type="number"
              min="1"
              defaultValue={lease?.adjustmentPeriodMonths?.toString() ?? '12'}
            />
          </div>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="startDate">Fecha de inicio</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(lease?.startDate)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="endDate">Fecha de término</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={toDateInputValue(lease?.endDate)}
          />
        </div>
      </div>

      <div className="form-actions">
        <SubmitButton>{lease ? 'Guardar cambios' : 'Crear contrato'}</SubmitButton>
        <Link href="/leases" className="btn btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
