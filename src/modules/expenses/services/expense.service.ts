import { DomainError } from '@/lib/errors';
import { validateExpense, type ExpenseInput } from '../domain/expense';
import { expenseRepository } from '../repositories/expense.repository';

export const expenseService = {
  listByProperty(propertyId: string) {
    return expenseRepository.listByProperty(propertyId);
  },

  totalByProperty(propertyId: string) {
    return expenseRepository.totalByProperty(propertyId);
  },

  create(input: ExpenseInput) {
    const validated = validateExpense(input);
    return expenseRepository.create(validated);
  },

  async delete(id: string) {
    const existing = await expenseRepository.findById(id);
    if (!existing) throw new DomainError('El gasto no existe.');
    return expenseRepository.delete(id);
  },
};
