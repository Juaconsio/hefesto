import { PrismaClient } from '@prisma/client';

// Singleton Prisma client. Reused across hot-reloads in dev to avoid exhausting
// connections. This is the ONLY module that instantiates PrismaClient; the rest
// of the app reaches the DB exclusively through repositories.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
