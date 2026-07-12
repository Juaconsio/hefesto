import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { billingService } from '@/modules/billing/services/billing.service';
import { currentPeriod } from '@/lib/date';
import { formatClp } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { GenerateChargesButton } from './GenerateChargesButton';
import { RegisterPaymentForm } from './RegisterPaymentForm';

export const dynamic = 'force-dynamic';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = periodParam && /^\d{4}-\d{2}$/.test(periodParam) ? periodParam : currentPeriod();
  const charges = await billingService.chargesForPeriod(period);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Cobranza</h1>
          <div className="subtitle">Cargos del período {period}.</div>
        </div>
        <GenerateChargesButton period={period} />
      </div>

      {charges.length === 0 ? (
        <div className="empty">
          No hay cargos para {period}. Usa <strong>Generar cargos del mes</strong> (requiere
          contratos vigentes).
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Inmueble</th>
              <th>Arrendatario</th>
              <th>Vence</th>
              <th>Cargo</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {charges.map((c) => {
              const paid = c.payments.reduce(
                (acc, p) => acc.plus(p.amount),
                new Prisma.Decimal(0),
              );
              const balance = c.amountClp.minus(paid);
              const settled = balance.lessThanOrEqualTo(0);
              return (
                <tr key={c.id}>
                  <td>
                    <Link href={`/properties/${c.lease.propertyId}`}>{c.lease.property.alias}</Link>
                  </td>
                  <td>{c.lease.tenant.name}</td>
                  <td>{formatDate(c.dueDate)}</td>
                  <td>{formatClp(c.amountClp.toString())}</td>
                  <td>{formatClp(paid.toString())}</td>
                  <td>
                    {settled ? (
                      <span className="badge badge-green">Al día</span>
                    ) : (
                      formatClp(balance.toString())
                    )}
                  </td>
                  <td>
                    {!settled && (
                      <RegisterPaymentForm
                        leaseId={c.leaseId}
                        chargeId={c.id}
                        defaultAmount={balance.toFixed(0)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
