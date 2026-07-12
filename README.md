# Hefesto

CRM de administración de arriendos. Herramienta de uso interno para una
administradora que opera inmuebles propios y administra inmuebles de terceros.

> **v0.1 — incremento actual:** fundaciones + módulos `properties` y `leasing`
> (propietarios, arrendatarios, contratos). La cobranza (billing), cuentas de
> servicio (utilities), gastos (expenses) y el reajuste llegan en incrementos
> posteriores.

## Stack

- **Next.js** (App Router) full-stack + **TypeScript**
- **Prisma** + **PostgreSQL**
- **pnpm**
- Auth0 (Google) y Cloudflare R2: previstos, aún no cableados (ver más abajo)

Convención: **código y modelo en inglés; español (chileno neutro) solo para lo
que ve el usuario** (labels, mensajes).

## Arquitectura (monolito modular por capas)

```
src/
  app/            Next.js App Router — capa delgada (páginas + server actions)
  components/     UI compartida
  lib/            prisma (singleton), money, rut (módulo 11), date (tz), auth, errors, form
  modules/
    properties/   domain → services → repositories
    leasing/      owners, tenants, leases (con máquina de estados del contrato)
prisma/
  schema.prisma   fuente de verdad del modelo de datos
  seed.ts
```

Reglas: `domain/` es puro (sin Prisma ni HTTP); `repositories/` es el **único**
lugar que toca Prisma; `services/` orquesta domain + repositories; las páginas y
server actions no llevan lógica de negocio. Dinero con `Decimal` (nunca float);
CLP redondeado al peso. Fechas en UTC, presentadas en `America/Santiago`.

## Puesta en marcha

Requiere Node 20+, pnpm y PostgreSQL (vía Docker o local).

```bash
# 1. Base de datos (Docker)
docker compose -f docker-compose.dev.yml up -d

# 2. Variables de entorno
cp .env.example .env      # ajusta DATABASE_URL si es necesario

# 3. Dependencias, migración y datos de ejemplo
pnpm install
pnpm db:migrate
pnpm db:seed

# 4. Desarrollo
pnpm dev                  # http://localhost:3000
```

Scripts útiles: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm db:studio`.

## Flujo funcional disponible

crear propietario → crear arrendatario → crear inmueble (propio o administrado)
→ crear contrato (borrador) → activar contrato (el inmueble pasa a *arrendado*)
→ terminar contrato (el inmueble queda *disponible*).

## Pendiente / diferido

- **Auth0**: hoy `src/lib/auth.ts` resuelve al `Owner` administrador sembrado
  (usuario único). Reemplazar por login real de Auth0 cuando exista tenant.
- **Cloudflare R2**: para comprobantes y fotos (billing/expenses). En la DB solo
  se guarda la URL.
- **billing, utilities, expenses, reajuste**: próximos incrementos (el esquema ya
  contempla sus tablas).
