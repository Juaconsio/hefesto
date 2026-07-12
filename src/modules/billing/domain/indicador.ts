import type { Prisma } from '@prisma/client';

// Port (interface) for economic indicators (UF/IPC). The domain and the billing
// service depend on THIS interface, not on any HTTP client — the concrete adapter
// (mindicador.cl + IndicatorValue cache with fallback) is injected/imported at the
// service edge. This is the extension seam for a different data source later.

export interface IndicadorEconomico {
  /**
   * UF value (in CLP) effective on the given date. Implementations must resolve
   * cache-first, then external source, then fall back to the last known value,
   * so a monthly billing run never fails just because the API is down.
   */
  ufValueAt(date: Date): Promise<Prisma.Decimal>;
}
