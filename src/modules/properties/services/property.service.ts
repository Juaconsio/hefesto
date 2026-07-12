import { DomainError } from '@/lib/errors';
import type { PropertyStatus } from '@prisma/client';
import { validateProperty, type PropertyInput } from '../domain/property';
import { propertyRepository } from '../repositories/property.repository';
import { ownerRepository } from '@/modules/leasing/repositories/owner.repository';

// Use cases for properties. Orchestrates domain rules + repositories.
// A module talks to another module through its service/repository, never its tables.

export const propertyService = {
  list() {
    return propertyRepository.list();
  },

  getById(id: string) {
    return propertyRepository.findById(id);
  },

  async create(input: PropertyInput) {
    const owner = await ownerRepository.findById(input.ownerId);
    if (!owner) throw new DomainError('El propietario seleccionado no existe.');
    const validated = validateProperty(input);
    return propertyRepository.create(validated);
  },

  async update(id: string, input: PropertyInput) {
    const existing = await propertyRepository.findById(id);
    if (!existing) throw new DomainError('El inmueble no existe.');
    const owner = await ownerRepository.findById(input.ownerId);
    if (!owner) throw new DomainError('El propietario seleccionado no existe.');
    const validated = validateProperty(input);
    return propertyRepository.update(id, validated);
  },

  /** Set a property's occupancy status. Used by leasing on lease activate/terminate. */
  setStatus(id: string, status: PropertyStatus) {
    return propertyRepository.updateStatus(id, status);
  },
};
