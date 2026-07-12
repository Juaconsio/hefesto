import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { ValidatedProperty } from '../domain/property';

// The ONLY place that touches Prisma for properties.

function toCreateData(v: ValidatedProperty): Prisma.PropertyCreateInput {
  return {
    owner: { connect: { id: v.ownerId } },
    alias: v.alias,
    address: v.address,
    comuna: v.comuna,
    siiRol: v.siiRol,
    type: v.type,
    tenure: v.tenure,
    status: v.status,
    dfl2: v.dfl2,
    commissionPct: v.commissionPct,
  };
}

export const propertyRepository = {
  list() {
    return prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: { owner: true },
    });
  },

  findById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      include: {
        owner: true,
        leases: {
          orderBy: { createdAt: 'desc' },
          include: { tenant: true },
        },
        utilityAccounts: { orderBy: { type: 'asc' } },
        expenses: { orderBy: { date: 'desc' } },
      },
    });
  },

  create(v: ValidatedProperty) {
    return prisma.property.create({ data: toCreateData(v) });
  },

  updateStatus(id: string, status: Prisma.PropertyUpdateInput['status']) {
    return prisma.property.update({ where: { id }, data: { status } });
  },

  update(id: string, v: ValidatedProperty) {
    return prisma.property.update({
      where: { id },
      data: {
        owner: { connect: { id: v.ownerId } },
        alias: v.alias,
        address: v.address,
        comuna: v.comuna,
        siiRol: v.siiRol,
        type: v.type,
        tenure: v.tenure,
        status: v.status,
        dfl2: v.dfl2,
        commissionPct: v.commissionPct,
      },
    });
  },
};

export type PropertyWithOwner = Prisma.PropertyGetPayload<{ include: { owner: true } }>;
export type PropertyDetail = NonNullable<
  Awaited<ReturnType<typeof propertyRepository.findById>>
>;
