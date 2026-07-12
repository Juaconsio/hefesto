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
  // Idempotent: keyed by alias so re-running the seed does not duplicate.
  const owned =
    (await prisma.property.findFirst({ where: { alias: 'Depto Propio (placeholder)' } })) ??
    (await prisma.property.create({
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
    }));

  await prisma.property.findFirst({ where: { alias: 'Casa Administrada (placeholder)' } }).then(
    (existing) =>
      existing ??
      prisma.property.create({
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
      }),
  );

  // A recent UF value so UF contracts resolve offline (mindicador.cl may be blocked).
  // The adapter falls back to the latest cached value when the API is unreachable.
  const ufDate = new Date(Date.UTC(2026, 6, 1)); // 2026-07-01
  await prisma.indicatorValue.upsert({
    where: { type_date: { type: 'UF', date: ufDate } },
    update: {},
    create: { type: 'UF', date: ufDate, value: new Prisma.Decimal('39150.50') },
  });

  // An ACTIVE lease on the owned property so Cobranza has something to charge.
  const existingLease = await prisma.lease.findFirst({ where: { propertyId: owned.id } });
  if (!existingLease) {
    await prisma.lease.create({
      data: {
        propertyId: owned.id,
        tenantId: tenant.id,
        baseAmount: new Prisma.Decimal('450000'),
        currency: 'CLP',
        dueDay: 5,
        adjustmentType: 'IPC',
        adjustmentPeriodMonths: 12,
        depositAmount: new Prisma.Decimal('450000'),
        startDate: new Date(Date.UTC(2026, 0, 1)),
        status: 'ACTIVE',
      },
    });
    await prisma.property.update({ where: { id: owned.id }, data: { status: 'RENTED' } });
  }

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
