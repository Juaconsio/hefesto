import { DomainError } from '@/lib/errors';
import { validateOwner, type OwnerInput } from '../domain/owner';
import { ownerRepository } from '../repositories/owner.repository';

export const ownerService = {
  list() {
    return ownerRepository.list();
  },

  getById(id: string) {
    return ownerRepository.findById(id);
  },

  async create(input: OwnerInput) {
    const validated = validateOwner(input);
    const existing = await ownerRepository.findByRut(validated.rut);
    if (existing) throw new DomainError('Ya existe un propietario con ese RUT.');
    return ownerRepository.create(validated);
  },

  async update(id: string, input: OwnerInput) {
    const current = await ownerRepository.findById(id);
    if (!current) throw new DomainError('El propietario no existe.');
    const validated = validateOwner(input);
    const existing = await ownerRepository.findByRut(validated.rut);
    if (existing && existing.id !== id) {
      throw new DomainError('Ya existe otro propietario con ese RUT.');
    }
    return ownerRepository.update(id, validated);
  },
};
