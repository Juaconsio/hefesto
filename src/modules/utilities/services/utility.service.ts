import { DomainError } from '@/lib/errors';
import { validateUtility, type UtilityInput } from '../domain/utility';
import { utilityRepository } from '../repositories/utility.repository';

export const utilityService = {
  listByProperty(propertyId: string) {
    return utilityRepository.listByProperty(propertyId);
  },

  create(input: UtilityInput) {
    const validated = validateUtility(input);
    return utilityRepository.create(validated);
  },

  async update(id: string, input: UtilityInput) {
    const existing = await utilityRepository.findById(id);
    if (!existing) throw new DomainError('La cuenta de servicio no existe.');
    const validated = validateUtility(input);
    return utilityRepository.update(id, validated);
  },

  async delete(id: string) {
    const existing = await utilityRepository.findById(id);
    if (!existing) throw new DomainError('La cuenta de servicio no existe.');
    return utilityRepository.delete(id);
  },
};
