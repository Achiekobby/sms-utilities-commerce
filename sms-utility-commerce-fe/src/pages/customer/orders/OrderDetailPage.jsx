import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatStamp } from '../../../features/contacts/contactImport'
import { statusLabel } from '../../../features/orders/orderRecord'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { paths } from '../../../routes/paths'
import { useGetClientOrderQuery } from '../../../services/api/orders/ordersApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { durationLabel } from '../../guest/pricingModel'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'

function StatusBadge({ status }) {
  const key = String(status ?? '').toLowerCase()
  const paid = key === 'paid' || key === 'success' || key === 'completed'
  const pending = key === 'pending' || key === 'processing'
  const failed = key === 'failed' || key === 'cancelled' || key === 'canceled'
  const tone = paid
    ? 'bg-[#E5F6EC] text-green'
    : pending
      ? 'bg-[#FFF4DF] text-[#B45F06]'
      : failed
        ? 'bg-[#FDECEE] text-[#9F1C26]'
        : 'bg-[#F3F6FB] text-navy'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {statusLabel(status)}
    </span>
  )
}

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value ?? '—'}</dd>
    </div>
  )
}

function metaLines(meta) {
  if (!meta) return []
  const lines = []
  if (meta.planName) lines.push(`Plan: ${meta.planName}`)
  if (meta.units != null) lines.push(`${formatCount(meta.units)} SMS units`)
  if (meta.type === 'non_expiry' || meta.type === 'non-expiry') {
    lines.push('Non-expiry package')
  } else if (meta.months != null) {
    lines.push(durationLabel(meta.months))
  } else if (meta.type) {
    lines.push(meta.type.replace(/_/g, ' '))
  }
  return lines
}

export function OrderDetailPage() {
  const { orderId } = useParams()
  const query = useGetClientOrderQuery(orderId, { skip: !orderId })
  const order = query.data
  useDocumentTitle(order?.orderCode ? `Order ${order.orderCode}` : 'Order')

  if (query.isLoading) {
    return (
      <div className="w-full">
        <span className="skeleton block h-4 w-28 rounded" />
        <span className="skeleton mt-4 block h-9 w-56 rounded" />
        <span className="skeleton mt-6 block h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (query.isError || !order) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <h1 className="text-2xl font-semibold text-navy">Order not found</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {query.isError
            ? apiErrorMessage(query.error) || 'That order could not be loaded.'
            : 'That order is not in this workspace.'}
        </p>
        <Link
          to={paths.orders}
          className={`mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}
        >
          <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
          Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">
              {order.orderCode || `Order #${order.id}`}
            </h1>
            {order.status ? <StatusBadge status={order.status} /> : null}
          </div>
          <p className="mt-1.5 text-sm text-ink/55">
            {order.quantity != null ? `${formatCount(order.quantity)} item${order.quantity === 1 ? '' : 's'}` : 'Order'}
            {order.createdAt ? ` · Created ${formatStamp(order.createdAt)}` : ''}
          </p>
        </div>
        <Link
          to={paths.orders}
          className={`inline-flex h-10 shrink-0 items-center gap-2 self-end rounded-xl border border-[#D8E7FA] bg-white px-3.5 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(20,115,230,0.06)] transition-colors hover:border-blue/30 hover:bg-[#F7FAFD] sm:self-start ${focusClass}`}
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-[#E8F1FF] text-blue">
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden="true" />
          </span>
          Back to orders
        </Link>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        <section className={card}>
          <h2 className="text-base font-bold text-navy">Items</h2>
          {order.items.length ? (
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => {
                const details = metaLines(item.meta)
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-[#E4EEF9] bg-[#F7FAFD] px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy">{item.name}</p>
                        <p className="mt-1 text-xs text-ink/55">{item.typeLabel}</p>
                        {details.length ? (
                          <ul className="mt-2 space-y-1">
                            {details.map((line) => (
                              <li key={line} className="text-[13px] text-ink/65">
                                {line}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-navy tabular-nums">
                        {formatWalletAmount(item.unitPrice, 'GHS')}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink/55">No items on this order.</p>
          )}
        </section>

        <section className={card}>
          <h2 className="text-base font-bold text-navy">Summary</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-navy tabular-nums">
            {formatWalletAmount(order.totalPrice, 'GHS')}
          </p>
          <dl className="mt-4">
            <Fact label="Order code" value={order.orderCode || '—'} />
            <Fact label="Status" value={order.status ? <StatusBadge status={order.status} /> : '—'} />
            <Fact
              label="Quantity"
              value={order.quantity != null ? formatCount(order.quantity) : '—'}
            />
            <Fact label="Total" value={formatWalletAmount(order.totalPrice, 'GHS')} />
            <Fact label="Created" value={formatStamp(order.createdAt) || '—'} />
          </dl>
        </section>
      </div>
    </div>
  )
}
