import { Prisma } from '@prisma/client';
import { currentPeriod } from '@/lib/date';
import { resolveDueDate, resolveAmountClp } from '../domain/charge';
import { chargeRepository } from '../repositories/charge.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { leaseService } from '@/modules/leasing/services/lease.service';
import { mindicadorAdapter } from './mindicador.adapter';
import type { IndicadorEconomico } from '../domain/indicador';

// The billing service orchestrates the monthly charge run and morosidad. It depends
// on the IndicadorEconomico *interface*; the concrete adapter is injected here.
const indicador: IndicadorEconomico = mindicadorAdapter;

export type MorosidadStatus = 'AL_DIA' | 'ATRASADO' | 'MOROSO';

export interface MorosidadRow {
  leaseId: string;
  propertyAlias: string;
  tenantName: string;
  charged: string; // CLP
  paid: string; // CLP
  debt: string; // CLP (>= 0)
  status: MorosidadStatus;
}

export const billingService = {
  chargesForPeriod(period: string) {
    return chargeRepository.listByPeriod(period);
  },

  /**
   * Generate one Charge per ACTIVE lease for the given period. Idempotent via the
   * (leaseId, period) unique key: an existing charge is skipped, so running twice
   * never duplicates. UF contracts are resolved to CLP at the charge's due date.
   */
  async generateMonthlyCharges(period: string = currentPeriod()) {
    const leases = await leaseService.listActive();
    let created = 0;
    let skipped = 0;

    for (const lease of leases) {
      const existing = await chargeRepository.findByLeaseAndPeriod(lease.id, period);
      if (existing) {
        skipped++;
        continue;
      }

      const dueDate = resolveDueDate(period, lease.dueDay);
      let ufValue: Prisma.Decimal | null = null;
      if (lease.currency === 'UF') {
        ufValue = await indicador.ufValueAt(dueDate);
      }
      const amountClp = resolveAmountClp(lease.baseAmount, lease.currency, ufValue);

      await chargeRepository.create({
        leaseId: lease.id,
        period,
        amountClp,
        ufValue,
        dueDate,
      });
      created++;
    }

    return { period, created, skipped, total: leases.length };
  },

  /** Morosidad per active lease: debt = Σ charges − Σ CONFIRMED payments. */
  async getMorosidad(now: Date = new Date()): Promise<MorosidadRow[]> {
    const leases = await leaseService.listActive();
    const rows: MorosidadRow[] = [];

    for (const lease of leases) {
      const charged = await chargeRepository.totalByLease(lease.id);
      const paid = await paymentRepository.confirmedTotalByLease(lease.id);
      const rawDebt = charged.minus(paid);
      const debt = rawDebt.isNegative() ? new Prisma.Decimal(0) : rawDebt;

      let status: MorosidadStatus;
      if (debt.lessThanOrEqualTo(0)) {
        status = 'AL_DIA';
      } else {
        const pastDue = await chargeRepository.countPastDueByLease(lease.id, now);
        status = pastDue >= 2 ? 'MOROSO' : 'ATRASADO';
      }

      rows.push({
        leaseId: lease.id,
        propertyAlias: lease.property.alias,
        tenantName: lease.tenant.name,
        charged: charged.toFixed(0),
        paid: paid.toFixed(0),
        debt: debt.toFixed(0),
        status,
      });
    }

    return rows;
  },
};

export const MOROSIDAD_STATUS_LABELS: Record<MorosidadStatus, string> = {
  AL_DIA: 'Al día',
  ATRASADO: 'Atrasado',
  MOROSO: 'Moroso',
};
