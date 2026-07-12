import { Prisma } from '@prisma/client';
import { DomainError } from '@/lib/errors';
import type { IndicadorEconomico } from '../domain/indicador';
import { indicatorRepository } from '../repositories/indicator.repository';

// Concrete IndicadorEconomico adapter backed by mindicador.cl, caching every value
// in IndicatorValue. Resolution order for a UF value at a date:
//   1. exact cache hit (type=UF, date)                     — no network
//   2. HTTP fetch from mindicador.cl → persist → return
//   3. fallback to the latest cached UF value               — API down / offline
//   4. otherwise DomainError (nothing to work with)
// This guarantees the monthly billing run degrades gracefully instead of failing.

const MINDICADOR_BASE = 'https://mindicador.cl/api/uf';

/** Format a UTC-anchored calendar day as dd-mm-yyyy for the mindicador.cl path. */
function toApiDate(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}-${m}-${y}`;
}

async function fetchUfFromApi(date: Date): Promise<Prisma.Decimal | null> {
  try {
    const res = await fetch(`${MINDICADOR_BASE}/${toApiDate(date)}`, {
      headers: { accept: 'application/json' },
      // Do not cache at the fetch layer; we cache in IndicatorValue ourselves.
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { serie?: Array<{ valor?: number }> };
    const valor = json.serie?.[0]?.valor;
    if (typeof valor !== 'number' || !Number.isFinite(valor)) return null;
    return new Prisma.Decimal(valor);
  } catch {
    // Network/parse failure → let the caller fall back to cache.
    return null;
  }
}

export const mindicadorAdapter: IndicadorEconomico = {
  async ufValueAt(date: Date): Promise<Prisma.Decimal> {
    // 1. exact cache hit
    const cached = await indicatorRepository.findByTypeAndDate('UF', date);
    if (cached) return cached.value;

    // 2. external source → persist
    const fetched = await fetchUfFromApi(date);
    if (fetched) {
      const saved = await indicatorRepository.upsert('UF', date, fetched);
      return saved.value;
    }

    // 3. fallback to last known UF value
    const latest = await indicatorRepository.findLatest('UF');
    if (latest) return latest.value;

    // 4. nothing available
    throw new DomainError(
      'No hay valor de UF disponible (API no accesible y sin valor en caché). ' +
        'Carga un valor de UF para continuar.',
    );
  },
};
