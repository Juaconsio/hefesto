import { PrismaClient, Prisma } from '@prisma/client';

// Seed with placeholders only. Real data is loaded separately.
// The administrator is an Owner with isAdmin = true (no commission).

const prisma = new PrismaClient();

async function main() {
  // Administrator (la mamá): owns some properties, manages others.
  const admin = await prisma.owner.upsert({
    where: { rut: '11111111-1' },
    update: {},
    create: {
      name: 'Administradora (placeholder)',
      rut: '11111111-1',
      email: 'admin@example.cl',
      isAdmin: true,
    },
  });

  // A third-party mandante whose properties the administrator manages.
  const mandante = await prisma.owner.upsert({
    where: { rut: '22222222-2' },
    update: {},
    create: {
      name: 'Propietario Mandante (placeholder)',
      rut: '22222222-2',
      email: 'mandante@example.cl',
      isAdmin: false,
    },
  });

  // A tenant placeholder.
  const tenant = await prisma.tenant.upsert({
    where: { rut: '33333333-3' },
    update: {},
    create: {
      name: 'Arrendatario (placeholder)',
      rut: '33333333-3',
      email: 'arrendatario@example.cl',
    },
  });

  // One owned property (no commission) and one managed property (with commission).
  const owned = await prisma.property.create({
    data: {
      ownerId: admin.id,
      alias: 'Depto Propio (placeholder)',
      address: 'Av. Siempre Viva 742',
      comuna: 'Ñuñoa',
      type: 'APARTMENT',
      tenure: 'OWNED',
      status: 'AVAILABLE',
      dfl2: true,
    },
  });

  await prisma.property.create({
    data: {
      ownerId: mandante.id,
      alias: 'Casa Administrada (placeholder)',
      address: 'Los Aromos 123',
      comuna: 'La Reina',
      type: 'HOUSE',
      tenure: 'MANAGED',
      status: 'AVAILABLE',
      commissionPct: new Prisma.Decimal('8.00'),
    },
  });

  console.log('Seed complete:', {
    admin: admin.name,
    mandante: mandante.name,
    tenant: tenant.name,
    ownedProperty: owned.alias,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
