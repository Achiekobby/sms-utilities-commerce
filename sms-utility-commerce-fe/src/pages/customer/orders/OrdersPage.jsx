import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatStamp } from '../../../features/contacts/contactImport'
import { orderStatuses, statusLabel } from '../../../features/orders/orderRecord'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { paths } from '../../../routes/paths'
import { useGetClientOrdersQuery } from '../../../services/api/orders/ordersApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { PageBar } from '../contacts/sections/PageBar'
import { formatCount } from '../dashboard/format'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head =
  'border-b border-[#E1EAF6] bg-[#F3F7FD] px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase first:pl-4 last:pr-4'
const cell = 'border-b border-[#E7EEF8] px-3 py-3 align-middle text-sm text-ink/75 first:pl-4 last:pr-4'
const field =
  'h-10 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-navy outline-none transition-colors hover:border-blue/35 focus:border-blue'

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
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {statusLabel(status)}
    </span>
  )
}

export function OrdersPage() {
  useDocumentTitle('Orders')
  const [page, setPage] = useState(1)
  const [draftStatus, setDraftStatus] = useState('')
  const [status, setStatus] = useState('')

  const queryArgs = useMemo(() => ({ page, status }), [page, status])
  const query = useGetClientOrdersQuery(queryArgs)
  const rows = query.data?.rows ?? []
  const lastPage = query.data?.lastPage ?? 1
  if (lastPage && page > lastPage) setPage(lastPage)

  function applyFilters(event) {
    event.preventDefault()
    setPage(1)
    setStatus(draftStatus)
  }

  function clearFilters() {
    setDraftStatus('')
    setStatus('')
    setPage(1)
  }

  return (
    <div className="w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Orders</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Review package purchases and other orders on your account.
        </p>
      </header>

      <form
        onSubmit={applyFilters}
        className="mt-6 flex flex-col gap-3 rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06)] sm:flex-row sm:items-end"
      >
        <label className="block min-w-0 flex-1 sm:max-w-xs">
          <span className="mb-1.5 block text-[12px] font-medium text-ink/55">Status</span>
          <select
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
            className={field}
          >
            {orderStatuses.map((option) => (
              <option key={option.id || 'all-status'} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className={`inline-flex h-10 items-center justify-center rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy/90 ${focusClass}`}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!status && !draftStatus}
            className={`inline-flex h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-45 ${focusClass}`}
          >
            Clear
          </button>
        </div>
      </form>

      <section aria-labelledby="orders-heading" className="mt-6" aria-busy={query.isFetching}>
        <h2 id="orders-heading" className="sr-only">
          Order history
        </h2>

        {query.isLoading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">Loading orders</span>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className="skeleton block h-12 rounded-lg" />
            ))}
          </div>
        ) : null}

        {query.isError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
            <button
              type="button"
              onClick={query.refetch}
              className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/15 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-navy">{status ? 'No matching orders' : 'No orders yet'}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
              {status
                ? 'Try a different status filter.'
                : 'Orders will appear here after you purchase a package.'}
            </p>
            {status ? (
              <button
                type="button"
                onClick={clearFilters}
                className={`mt-4 inline-flex h-9 items-center rounded-lg bg-navy px-3.5 text-sm font-semibold text-white ${focusClass}`}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {rows.length ? (
          <>
            <div
              className={`hidden overflow-x-auto rounded-lg border border-ink/10 md:block ${query.isFetching ? 'opacity-60' : ''}`}
            >
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className={head}>Order</th>
                    <th className={head}>Items</th>
                    <th className={head}>Qty</th>
                    <th className={`${head} text-right`}>Total</th>
                    <th className={head}>Status</th>
                    <th className={head}>Date</th>
                    <th className={head}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className={`${cell} font-mono text-xs font-semibold text-navy`}>
                        {row.orderCode || `Order #${row.id}`}
                      </td>
                      <td className={`${cell} max-w-[18rem]`}>
                        <span className="line-clamp-2">{row.summary}</span>
                      </td>
                      <td className={`${cell} tabular-nums`}>
                        {row.quantity != null ? formatCount(row.quantity) : '—'}
                      </td>
                      <td className={`${cell} text-right font-semibold whitespace-nowrap text-navy tabular-nums`}>
                        {formatWalletAmount(row.totalPrice, 'GHS')}
                      </td>
                      <td className={cell}>{row.status ? <StatusBadge status={row.status} /> : '—'}</td>
                      <td className={`${cell} whitespace-nowrap text-ink/60`}>
                        {formatStamp(row.createdAt) || '—'}
                      </td>
                      <td className={`${cell} text-right`}>
                        <Link
                          to={paths.order(row.id)}
                          className={`text-sm font-semibold text-blue hover:text-navy ${focusClass}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul
              className={`divide-y divide-[#E7EEF8] rounded-lg border border-ink/10 md:hidden ${query.isFetching ? 'opacity-60' : ''}`}
            >
              {rows.map((row) => (
                <li key={row.id} className="px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-navy">
                        {row.orderCode || `Order #${row.id}`}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-navy">{row.summary}</p>
                      <p className="mt-1 text-sm font-semibold text-navy tabular-nums">
                        {formatWalletAmount(row.totalPrice, 'GHS')}
                      </p>
                      <p className="mt-1 text-xs text-ink/55">{formatStamp(row.createdAt) || '—'}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {row.status ? <StatusBadge status={row.status} /> : null}
                      <Link to={paths.order(row.id)} className={`text-sm font-semibold text-blue ${focusClass}`}>
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <PageBar
              page={query.data?.page ?? page}
              lastPage={lastPage}
              total={query.data?.total ?? 0}
              perPage={query.data?.perPage ?? 15}
              onPage={setPage}
              label="Order pages"
            />
          </>
        ) : null}
      </section>
    </div>
  )
}
