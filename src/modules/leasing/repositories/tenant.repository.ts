import { prisma } from '@/lib/prisma';
import type { ValidatedTenant } from '../domain/tenant';

// The ONLY place that touches Prisma for tenants.
export const tenantRepository = {
  list() {
    return prisma.tenant.findMany({ orderBy: { name: 'asc' } });
  },

  findById(id: string) {
    return prisma.tenant.findUnique({ where: { id } });
  },

  findByRut(rut: string) {
    return prisma.tenant.findUnique({ where: { rut } });
  },

  create(v: ValidatedTenant) {
    return prisma.tenant.create({ data: v });
  },

  update(id: string, v: ValidatedTenant) {
    return prisma.tenant.update({ where: { id }, data: v });
  },
};
