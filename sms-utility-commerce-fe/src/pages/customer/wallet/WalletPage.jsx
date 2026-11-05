import { useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatTopUpDay, formatWalletAmount, statusLabel } from '../../../features/wallet/walletRecord'
import { useGetWalletQuery, useGetWalletTopUpsQuery } from '../../../services/api/wallet/walletApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { PageBar } from '../contacts/sections/PageBar'
import { WalletTopUpDrawer } from './sections/WalletTopUpDrawer'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head =
  'border-b border-[#E1EAF6] bg-[#F3F7FD] px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase first:pl-4 last:pr-4'
const cell = 'border-b border-[#E7EEF8] px-3 py-3 align-middle text-sm text-ink/75 first:pl-4 last:pr-4'

function StatusBadge({ status }) {
  const active = status === 'active' || status === 'completed' || status === 'success'
  const pending = status === 'pending' || status === 'processing'
  const tone = active
    ? 'bg-[#E5F6EC] text-green'
    : pending
      ? 'bg-[#FFF4DF] text-[#B45F06]'
      : 'bg-[#F3F6FB] text-navy'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {statusLabel(status)}
    </span>
  )
}

function topUpButton(onClick, className = '') {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-green px-3.5 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass} ${className}`}
    >
      Top up wallet
    </button>
  )
}

export function WalletPage() {
  useDocumentTitle('Wallet')
  const [page, setPage] = useState(1)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const wallet = useGetWalletQuery()
  const history = useGetWalletTopUpsQuery({ page })
  const account = wallet.data
  const rows = history.data?.rows ?? []
  const lastPage = history.data?.lastPage ?? 1
  if (lastPage && page > lastPage) setPage(lastPage)

  const showAmount = rows.some((row) => row.amount)
  const showMethod = rows.some((row) => row.method)
  const showNetwork = rows.some((row) => row.network)
  const showStatus = rows.some((row) => row.status)
  const showDate = rows.some((row) => row.createdAt)
  const showReference = rows.some((row) => row.reference)

  return (
    <div className="w-full">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Wallet</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            Manage your wallet balance and view your top-up history.
          </p>
        </div>
      </header>

      {wallet.isLoading ? (
        <div role="status" className="mt-6 rounded-lg border border-ink/10 bg-white px-5 py-5">
          <span className="sr-only">Loading wallet</span>
          <span className="skeleton block h-3 w-28 rounded" />
          <span className="skeleton mt-3 block h-8 w-40 rounded" />
          <span className="skeleton mt-3 block h-5 w-16 rounded-full" />
        </div>
      ) : null}

      {wallet.isError ? (
        <div role="alert" className="mt-6 flex flex-col gap-3 rounded-lg border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(wallet.error)}</p>
          <button type="button" onClick={wallet.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : null}

      {account ? (
        <section aria-labelledby="balance-heading" className="mt-6 flex flex-col gap-4 rounded-lg border border-ink/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
          <div>
            <h2 id="balance-heading" className="text-[13px] font-medium text-ink/55">
              Available balance
            </h2>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-navy tabular-nums">
              {formatWalletAmount(account.balance, account.currency)}
            </p>
            {account.status ? (
              <div className="mt-2">
                <StatusBadge status={account.status} />
              </div>
            ) : null}
          </div>
          {topUpButton(() => setTopUpOpen(true), 'w-full sm:w-auto')}
        </section>
      ) : null}

      <section aria-labelledby="history-heading" className="mt-8">
        <h2 id="history-heading" className="text-[15px] font-semibold text-navy">
          Top-up history
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-ink/60">View previous wallet funding transactions.</p>

        {history.isLoading ? (
          <div role="status" className="mt-4 space-y-2">
            <span className="sr-only">Loading top-ups</span>
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="skeleton block h-11 rounded-lg" />
            ))}
          </div>
        ) : null}

        {history.isError ? (
          <div role="alert" className="mt-4 flex flex-col gap-3 rounded-lg border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(history.error)}</p>
            <button type="button" onClick={history.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}

        {!history.isLoading && !history.isError && rows.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-ink/15 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-navy">No top-ups yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
              Wallet funding transactions will appear here after you make your first top-up.
            </p>
            <div className="mt-4">{topUpButton(() => setTopUpOpen(true))}</div>
          </div>
        ) : null}

        {rows.length ? (
          <>
            <div className="mt-4 hidden overflow-x-auto rounded-lg border border-ink/10 md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    {showDate ? <th className={head}>Date</th> : null}
                    {showAmount ? <th className={`${head} text-right`}>Amount</th> : null}
                    {showMethod ? <th className={head}>Method</th> : null}
                    {showNetwork ? <th className={head}>Network</th> : null}
                    {showStatus ? <th className={head}>Status</th> : null}
                    {showReference ? <th className={head}>Reference</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {showDate ? <td className={`${cell} whitespace-nowrap`}>{formatTopUpDay(row.createdAt)}</td> : null}
                      {showAmount ? (
                        <td className={`${cell} text-right font-semibold whitespace-nowrap text-navy tabular-nums`}>
                          {formatWalletAmount(row.amount, row.currency || account?.currency)}
                        </td>
                      ) : null}
                      {showMethod ? <td className={cell}>{row.methodLabel || '—'}</td> : null}
                      {showNetwork ? <td className={cell}>{row.networkLabel || '—'}</td> : null}
                      {showStatus ? (
                        <td className={cell}>{row.status ? <StatusBadge status={row.status} /> : '—'}</td>
                      ) : null}
                      {showReference ? <td className={`${cell} font-mono text-xs`}>{row.reference}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-lg border border-ink/10 md:hidden">
              {rows.map((row) => (
                <li key={row.id} className="space-y-1 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-navy tabular-nums">
                      {row.amount ? formatWalletAmount(row.amount, row.currency || account?.currency) : 'Top-up'}
                    </p>
                    {row.status ? <StatusBadge status={row.status} /> : null}
                  </div>
                  <p className="text-xs text-ink/55">
                    {[formatTopUpDay(row.createdAt), row.methodLabel, row.networkLabel, row.reference].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>

            <PageBar
              page={history.data?.page ?? page}
              lastPage={lastPage}
              total={history.data?.total ?? 0}
              perPage={history.data?.perPage ?? 15}
              onPage={setPage}
              label="Top-up pages"
            />
          </>
        ) : null}
      </section>

      {topUpOpen ? (
        <WalletTopUpDrawer currency={account?.currency} onClose={() => setTopUpOpen(false)} />
      ) : null}
    </div>
  )
}
