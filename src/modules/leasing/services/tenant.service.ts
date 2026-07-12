import { DomainError } from '@/lib/errors';
import { validateTenant, type TenantInput } from '../domain/tenant';
import { tenantRepository } from '../repositories/tenant.repository';

export const tenantService = {
  list() {
    return tenantRepository.list();
  },

  getById(id: string) {
    return tenantRepository.findById(id);
  },

  async create(input: TenantInput) {
    const validated = validateTenant(input);
    const existing = await tenantRepository.findByRut(validated.rut);
    if (existing) throw new DomainError('Ya existe un arrendatario con ese RUT.');
    return tenantRepository.create(validated);
  },

  async update(id: string, input: TenantInput) {
    const current = await tenantRepository.findById(id);
    if (!current) throw new DomainError('El arrendatario no existe.');
    const validated = validateTenant(input);
    const existing = await tenantRepository.findByRut(validated.rut);
    if (existing && existing.id !== id) {
      throw new DomainError('Ya existe otro arrendatario con ese RUT.');
    }
    return tenantRepository.update(id, validated);
  },
};
