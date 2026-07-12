import { DomainError } from '@/lib/errors';
import { validateLease, assertTransition, type LeaseInput } from '../domain/lease';
import { leaseRepository } from '../repositories/lease.repository';
import { propertyRepository } from '@/modules/properties/repositories/property.repository';
import { tenantRepository } from '../repositories/tenant.repository';
import { propertyService } from '@/modules/properties/services/property.service';

export const leaseService = {
  list() {
    return leaseRepository.list();
  },

  getById(id: string) {
    return leaseRepository.findById(id);
  },

  activeByProperty(propertyId: string) {
    return leaseRepository.findActiveByProperty(propertyId);
  },

  async create(input: LeaseInput) {
    const property = await propertyRepository.findById(input.propertyId);
    if (!property) throw new DomainError('El inmueble seleccionado no existe.');
    const tenant = await tenantRepository.findById(input.tenantId);
    if (!tenant) throw new DomainError('El arrendatario seleccionado no existe.');
    const validated = validateLease(input);
    return leaseRepository.create(validated);
  },

  async update(id: string, input: LeaseInput) {
    const current = await leaseRepository.findById(id);
    if (!current) throw new DomainError('El contrato no existe.');
    if (current.status !== 'DRAFT') {
      throw new DomainError('Solo se pueden editar contratos en borrador.');
    }
    const validated = validateLease(input);
    return leaseRepository.update(id, validated);
  },

  /** DRAFT -> ACTIVE. Also marks the property as RENTED. */
  async activate(id: string) {
    const lease = await leaseRepository.findById(id);
    if (!lease) throw new DomainError('El contrato no existe.');
    assertTransition(lease.status, 'ACTIVE');

    // Guard: a property can only have one active lease at a time.
    const existingActive = await leaseRepository.findActiveByProperty(lease.propertyId);
    if (existingActive) {
      throw new DomainError('El inmueble ya tiene un contrato vigente.');
    }

    const updated = await leaseRepository.updateStatus(id, 'ACTIVE');
    await propertyService.setStatus(lease.propertyId, 'RENTED');
    return updated;
  },

  /** ACTIVE -> TERMINATED. Frees the property (AVAILABLE). */
  async terminate(id: string) {
    const lease = await leaseRepository.findById(id);
    if (!lease) throw new DomainError('El contrato no existe.');
    assertTransition(lease.status, 'TERMINATED');

    const updated = await leaseRepository.updateStatus(id, 'TERMINATED');
    await propertyService.setStatus(lease.propertyId, 'AVAILABLE');
    return updated;
  },
};
