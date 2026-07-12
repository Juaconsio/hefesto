import { prisma } from '@/lib/prisma';
import type { Owner } from '@prisma/client';

// Auth stub for v0.1. Hefesto is single-user: the administrator.
//
// TODO(Auth0): replace this with real Auth0 (Google login). Once a tenant and
// credentials exist, wire the Auth0 middleware, read the session here, and map
// the authenticated user to the admin Owner. Until then we resolve the seeded
// admin Owner (isAdmin = true) so the rest of the app can assume a current user.

let cachedAdminId: string | null = null;

/** The current (single) user. Returns the admin Owner seeded in the DB. */
export async function getCurrentUser(): Promise<Owner> {
  if (cachedAdminId) {
    const owner = await prisma.owner.findUnique({ where: { id: cachedAdminId } });
    if (owner) return owner;
    cachedAdminId = null;
  }

  const admin = await prisma.owner.findFirst({ where: { isAdmin: true } });
  if (!admin) {
    throw new Error(
      'No admin Owner found. Run `pnpm db:seed` to create the administrator.',
    );
  }
  cachedAdminId = admin.id;
  return admin;
}
