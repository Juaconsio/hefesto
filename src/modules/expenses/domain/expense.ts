import { DomainError } from '@/lib/errors';
import type { ExpenseCategory } from '@prisma/client';

// Pure domain: Expense rules + labels.

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  REPAIR: 'Arreglo',
  REMODELING: 'Remodelación',
  MAINTENANCE: 'Mantención',
  OTHER: 'Otro',
};

export interface ExpenseInput {
  propertyId: string;
  category: ExpenseCategory;
  description: string;
  amount: number | string;
  date: Date;
  billableToOwner?: boolean;
  receiptUrl?: string | null;
  photoUrl?: string | null;
}

export interface ValidatedExpense {
  propertyId: string;
  category: ExpenseCategory;
  description: string;
  amount: string;
  date: Date;
  billableToOwner: boolean;
  receiptUrl: string | null;
  photoUrl: string | null;
}

export function validateExpense(input: ExpenseInput): ValidatedExpense {
  if (!input.propertyId) throw new DomainError('Falta el inmueble.');
  const description = input.description?.trim();
  if (!description) throw new DomainError('La descripción es obligatoria.');

  const amount = Number(input.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new DomainError('El monto del gasto debe ser mayor que cero.');
  }

  if (!input.date || Number.isNaN(input.date.getTime())) {
    throw new DomainError('La fecha del gasto es obligatoria.');
  }

  const receiptUrl = input.receiptUrl?.trim() || null;
  const photoUrl = input.photoUrl?.trim() || null;
  const billableToOwner = input.billableToOwner ?? false;

  // Differentiator (backlog E7): a cost imputed to the owner's rendición must carry
  // supporting evidence (boleta/factura o foto). No respaldo, no imputación.
  if (billableToOwner && !receiptUrl && !photoUrl) {
    throw new DomainError(
      'Un gasto imputado al propietario requiere respaldo (comprobante o foto).',
    );
  }

  return {
    propertyId: input.propertyId,
    category: input.category,
    description,
    amount: amount.toFixed(2),
    date: input.date,
    billableToOwner,
    receiptUrl,
    photoUrl,
  };
}
