import { prisma } from '@/lib/prisma';
import type { ValidatedOwner } from '../domain/owner';

// The ONLY place that touches Prisma for owners.
export const ownerRepository = {
  list() {
    return prisma.owner.findMany({ orderBy: { name: 'asc' } });
  },

  findById(id: string) {
    return prisma.owner.findUnique({ where: { id } });
  },

  findByRut(rut: string) {
    return prisma.owner.findUnique({ where: { rut } });
  },

  create(v: ValidatedOwner) {
    return prisma.owner.create({ data: v });
  },

  update(id: string, v: ValidatedOwner) {
    return prisma.owner.update({ where: { id }, data: v });
  },
};
