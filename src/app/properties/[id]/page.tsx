import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { propertyService } from '@/modules/properties/services/property.service';
import {
  PROPERTY_TYPE_LABELS,
  TENURE_LABELS,
} from '@/modules/properties/domain/property';
import { LEASE_STATUS_LABELS } from '@/modules/leasing/domain/lease';
import {
  UTILITY_TYPE_LABELS,
  UTILITY_PAYER_LABELS,
} from '@/modules/utilities/domain/utility';
import { EXPENSE_CATEGORY_LABELS } from '@/modules/expenses/domain/expense';
import { PropertyStatusBadge, LeaseStatusBadge, UtilityStatusBadge } from '@/components/badges';
import { formatMoney, formatClp } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { formatRut } from '@/lib/rut';
import { AddUtilityForm } from './AddUtilityForm';
import { EditUtilityForm } from './EditUtilityForm';
import { AddExpenseForm } from './AddExpenseForm';
import { addUtility, updateUtility, deleteUtility, addExpense, deleteExpense } from './actions';

export const dynamic = 'force-dynamic';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await propertyService.getById(id);
  if (!property) notFound();

  const activeLease = property.leases.find((l) => l.status === 'ACTIVE');
  const expensesTotal = property.expenses.reduce(
    (acc, e) => acc.plus(e.amount),
    new Prisma.Decimal(0),
  );
  const addUtilityAction = addUtility.bind(null, property.id);
  const addExpenseAction = addExpense.bind(null, property.id);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{property.alias}</h1>
          <div className="subtitle">
            {property.address}, {property.comuna} · <PropertyStatusBadge status={property.status} />
          </div>
        </div>
        <div className="inline-actions">
          <Link href={`/properties/${property.id}/edit`} className="btn btn-secondary">
            Editar
          </Link>
          <Link href={`/leases/new?propertyId=${property.id}`} className="btn">
            Nuevo contrato
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Datos del inmueble</h2>
        <dl className="dl">
          <dt>Propietario</dt>
          <dd>
            {property.owner.name} ({formatRut(property.owner.rut)}){' '}
            {property.owner.isAdmin && <span className="badge badge-green">Administradora</span>}
          </dd>
          <dt>Tipo</dt>
          <dd>{PROPERTY_TYPE_LABELS[property.type]}</dd>
          <dt>Tenencia</dt>
          <dd>
            {TENURE_LABELS[property.tenure]}
            {property.tenure === 'MANAGED' && property.commissionPct != null
              ? ` · comisión ${property.commissionPct.toString()}%`
              : ''}
          </dd>
          <dt>Rol SII</dt>
          <dd>{property.siiRol ?? '—'}</dd>
          <dt>DFL2</dt>
          <dd>{property.dfl2 ? 'Sí' : 'No'}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Contrato vigente</h2>
        {activeLease ? (
          <dl className="dl">
            <dt>Arrendatario</dt>
            <dd>
              <Link href={`/leases/${activeLease.id}`}>{activeLease.tenant.name}</Link>
            </dd>
            <dt>Monto</dt>
            <dd>{formatMoney(activeLease.baseAmount.toString(), activeLease.currency)}</dd>
            <dt>Vence día</dt>
            <dd>{activeLease.dueDay} de cada mes</dd>
            <dt>Inicio</dt>
            <dd>{formatDate(activeLease.startDate)}</dd>
            <dt>Estado</dt>
            <dd>
              <LeaseStatusBadge status={activeLease.status} />
            </dd>
          </dl>
        ) : (
          <p className="muted">
            Sin contrato vigente.{' '}
            <Link href={`/leases/new?propertyId=${property.id}`}>Crear uno</Link>.
          </p>
        )}
      </div>

      {property.leases.length > 0 && (
        <div className="card">
          <h2>Historial de contratos</h2>
          <table>
            <thead>
              <tr>
                <th>Arrendatario</th>
                <th>Monto</th>
                <th>Inicio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {property.leases.map((l) => (
                <tr key={l.id}>
                  <td>{l.tenant.name}</td>
                  <td>{formatMoney(l.baseAmount.toString(), l.currency)}</td>
                  <td>{formatDate(l.startDate)}</td>
                  <td>{LEASE_STATUS_LABELS[l.status]}</td>
                  <td>
                    <Link href={`/leases/${l.id}`}>Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h2>Cuentas de servicio</h2>
        {property.utilityAccounts.length === 0 ? (
          <p className="muted">Sin cuentas registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Paga</th>
                <th>Proveedor</th>
                <th>Monto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {property.utilityAccounts.map((u) => {
                const del = deleteUtility.bind(null, property.id, u.id);
                const edit = updateUtility.bind(null, property.id, u.id);
                return (
                  <tr key={u.id}>
                    <td>{UTILITY_TYPE_LABELS[u.type]}</td>
                    <td>{UTILITY_PAYER_LABELS[u.payer]}</td>
                    <td>{u.provider ?? '—'}</td>
                    <td>{u.currentAmount != null ? formatClp(u.currentAmount.toString()) : '—'}</td>
                    <td>
                      <UtilityStatusBadge status={u.status} />
                    </td>
                    <td>
                      <div className="inline-actions">
                        <EditUtilityForm action={edit} utility={u} />
                        <form action={del}>
                          <button type="submit" className="btn btn-danger">
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <AddUtilityForm action={addUtilityAction} />
      </div>

      <div className="card">
        <h2>Gastos</h2>
        {property.expenses.length === 0 ? (
          <p className="muted">Sin gastos registrados.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Imputable</th>
                  <th>Respaldo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {property.expenses.map((e) => {
                  const del = deleteExpense.bind(null, property.id, e.id);
                  return (
                    <tr key={e.id}>
                      <td>{formatDate(e.date)}</td>
                      <td>{EXPENSE_CATEGORY_LABELS[e.category]}</td>
                      <td>{e.description}</td>
                      <td>{formatClp(e.amount.toString())}</td>
                      <td>{e.billableToOwner ? 'Sí' : 'No'}</td>
                      <td>
                        {e.receiptUrl && (
                          <a href={e.receiptUrl} target="_blank" rel="noreferrer">
                            comprobante
                          </a>
                        )}
                        {e.receiptUrl && e.photoUrl ? ' · ' : ''}
                        {e.photoUrl && (
                          <a href={e.photoUrl} target="_blank" rel="noreferrer">
                            foto
                          </a>
                        )}
                        {!e.receiptUrl && !e.photoUrl && '—'}
                      </td>
                      <td>
                        <form action={del}>
                          <button type="submit" className="btn btn-danger">
                            Eliminar
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="muted" style={{ marginTop: 12 }}>
              Total invertido: <strong>{formatClp(expensesTotal.toString())}</strong>
            </p>
          </>
        )}
        <AddExpenseForm action={addExpenseAction} />
      </div>
    </>
  );
}
