import { useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatWalletAmount, formatWalletWhen, statusLabel } from '../../../features/wallet/walletRecord'
import { useGetWalletQuery, useGetWalletTopUpsQuery, useGetWalletTransactionsQuery, WALLET_PAGE_SIZE } from '../../../services/api/wallet/walletApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useDebouncedValue } from '../../../utils/hooks/useDebouncedValue'
import { PageBar } from '../contacts/sections/PageBar'
import { WalletListFilters } from './sections/WalletListFilters'
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
  const [topUpPage, setTopUpPage] = useState(1)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [txSearch, setTxSearch] = useState('')
  const [txFrom, setTxFrom] = useState('')
  const [txTo, setTxTo] = useState('')
  const [txType, setTxType] = useState('')
  const [txPurpose, setTxPurpose] = useState('')
  const [topSearch, setTopSearch] = useState('')
  const [topFrom, setTopFrom] = useState('')
  const [topTo, setTopTo] = useState('')
  const txTerm = useDebouncedValue(txSearch.trim())
  const topTerm = useDebouncedValue(topSearch.trim())
  const wallet = useGetWalletQuery()
  const topUps = useGetWalletTopUpsQuery({
    page: topUpPage,
    perPage: WALLET_PAGE_SIZE,
    search: topTerm,
    from: topFrom,
    to: topTo,
  })
  const history = useGetWalletTransactionsQuery({
    page,
    perPage: WALLET_PAGE_SIZE,
    search: txTerm,
    from: txFrom,
    to: txTo,
    type: txType,
    purpose: txPurpose,
  })
  const account = wallet.data
  const rows = history.data?.rows ?? []
  const topUpRows = topUps.data?.rows ?? []
  const lastPage = history.data?.lastPage ?? 1
  const topUpLastPage = topUps.data?.lastPage ?? 1
  const currency = account?.currency || 'GHS'
  const txFiltered = Boolean(txTerm || txFrom || txTo || txType || txPurpose)
  const topFiltered = Boolean(topTerm || topFrom || topTo)
  if (lastPage && page > lastPage) setPage(lastPage)
  if (topUpLastPage && topUpPage > topUpLastPage) setTopUpPage(topUpLastPage)

  function changeTransactions(patch) {
    if ('search' in patch) setTxSearch(patch.search)
    if ('from' in patch) setTxFrom(patch.from)
    if ('to' in patch) setTxTo(patch.to)
    if ('type' in patch) setTxType(patch.type)
    if ('purpose' in patch) setTxPurpose(patch.purpose)
    setPage(1)
  }

  function changeTopUps(patch) {
    if ('search' in patch) setTopSearch(patch.search)
    if ('from' in patch) setTopFrom(patch.from)
    if ('to' in patch) setTopTo(patch.to)
    setTopUpPage(1)
  }

  return (
    <div className="w-full">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Wallet</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            Manage your wallet balance and review every credit and debit.
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

      <section aria-labelledby="topups-heading" className="mt-8">
        <h2 id="topups-heading" className="text-[15px] font-semibold text-navy">
          Top-ups
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-ink/60">Money added to this wallet, including any charge.</p>
        <WalletListFilters
          label="Filter top-ups"
          search={topSearch}
          from={topFrom}
          to={topTo}
          onChange={changeTopUps}
          onClear={() => {
            setTopSearch('')
            setTopFrom('')
            setTopTo('')
            setTopUpPage(1)
          }}
        />

        {topUps.isLoading ? (
          <div role="status" className="mt-4 space-y-2">
            <span className="sr-only">Loading top-ups</span>
            {Array.from({ length: 3 }, (_, index) => (
              <span key={index} className="skeleton block h-11 rounded-lg" />
            ))}
          </div>
        ) : null}

        {topUps.isError ? (
          <div role="alert" className="mt-4 flex flex-col gap-3 rounded-lg border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(topUps.error)}</p>
            <button type="button" onClick={topUps.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}

        {!topUps.isLoading && !topUps.isError && topUpRows.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-ink/15 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-navy">{topFiltered ? 'No matching top-ups' : 'No top-ups yet'}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
              {topFiltered ? 'Try a different search or date range.' : 'Completed wallet funding will appear here.'}
            </p>
          </div>
        ) : null}

        {topUpRows.length ? (
          <>
            <div className="mt-4 hidden overflow-x-auto rounded-lg border border-ink/10 md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className={head}>Date</th>
                    <th className={`${head} text-right`}>Amount</th>
                    <th className={`${head} text-right`}>Charge</th>
                    <th className={`${head} text-right`}>Paid</th>
                    <th className={`${head} text-right`}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {topUpRows.map((row) => {
                    const code = row.currency || currency
                    return (
                      <tr key={row.id}>
                        <td className={`${cell} whitespace-nowrap`}>{formatWalletWhen(row.createdAt)}</td>
                        <td className={`${cell} text-right font-semibold whitespace-nowrap text-navy tabular-nums`}>
                          {formatWalletAmount(row.amount, code)}
                        </td>
                        <td className={`${cell} text-right whitespace-nowrap tabular-nums`}>{formatWalletAmount(row.charge, code)}</td>
                        <td className={`${cell} text-right whitespace-nowrap tabular-nums`}>{formatWalletAmount(row.amountPaid, code)}</td>
                        <td className={`${cell} text-right font-semibold whitespace-nowrap text-navy tabular-nums`}>
                          {formatWalletAmount(row.balanceAfter, code)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-lg border border-ink/10 md:hidden">
              {topUpRows.map((row) => {
                const code = row.currency || currency
                return (
                  <li key={row.id} className="space-y-1 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-navy">Top-up</p>
                      <p className="text-sm font-semibold whitespace-nowrap text-green tabular-nums">
                        + {formatWalletAmount(row.amount, code)}
                      </p>
                    </div>
                    <p className="text-[13px] leading-5 text-ink/60">
                      Charge {formatWalletAmount(row.charge, code)} · Paid {formatWalletAmount(row.amountPaid, code)}
                    </p>
                    <p className="text-xs text-ink/45">
                      {formatWalletWhen(row.createdAt)}
                      {row.balanceAfter ? ` · Balance ${formatWalletAmount(row.balanceAfter, code)}` : ''}
                    </p>
                  </li>
                )
              })}
            </ul>

            <PageBar
              page={topUps.data?.page ?? topUpPage}
              lastPage={topUpLastPage}
              total={topUps.data?.total ?? 0}
              perPage={topUps.data?.perPage ?? WALLET_PAGE_SIZE}
              onPage={setTopUpPage}
              label="Top-up pages"
            />
          </>
        ) : null}
      </section>

      <section aria-labelledby="history-heading" className="mt-8">
        <h2 id="history-heading" className="text-[15px] font-semibold text-navy">
          Transactions
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-ink/60">Credits and debits on this wallet, newest first.</p>
        <WalletListFilters
          label="Filter transactions"
          search={txSearch}
          from={txFrom}
          to={txTo}
          type={txType}
          purpose={txPurpose}
          showType
          showPurpose
          onChange={changeTransactions}
          onClear={() => {
            setTxSearch('')
            setTxFrom('')
            setTxTo('')
            setTxType('')
            setTxPurpose('')
            setPage(1)
          }}
        />

        {history.isLoading ? (
          <div role="status" className="mt-4 space-y-2">
            <span className="sr-only">Loading transactions</span>
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
            <p className="text-sm font-semibold text-navy">{txFiltered ? 'No matching transactions' : 'No transactions yet'}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
              {txFiltered
                ? 'Try a different search, date, type, or purpose.'
                : 'Top-ups and purchases will show up here once money moves in or out of the wallet.'}
            </p>
            {txFiltered ? null : <div className="mt-4">{topUpButton(() => setTopUpOpen(true))}</div>}
          </div>
        ) : null}

        {rows.length ? (
          <>
            <div className="mt-4 hidden overflow-x-auto rounded-lg border border-ink/10 md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className={head}>Date</th>
                    <th className={head}>Transaction</th>
                    <th className={`${head} text-right`}>Amount</th>
                    <th className={`${head} text-right`}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className={`${cell} whitespace-nowrap`}>{formatWalletWhen(row.createdAt)}</td>
                      <td className={cell}>
                        <p className="font-semibold text-navy">{row.purposeLabel || 'Wallet transaction'}</p>
                        {row.description ? <p className="mt-0.5 max-w-md text-[13px] leading-5 text-ink/55">{row.description}</p> : null}
                      </td>
                      <td className={`${cell} text-right font-semibold whitespace-nowrap tabular-nums`}>
                        <span className={row.credit ? 'text-green' : 'text-[#9F1C26]'}>
                          {row.credit ? '+ ' : '− '}
                          {formatWalletAmount(row.amount, currency)}
                        </span>
                        {row.typeLabel ? <p className="mt-0.5 text-[11px] font-medium text-ink/40">{row.typeLabel}</p> : null}
                      </td>
                      <td className={`${cell} text-right font-semibold whitespace-nowrap text-navy tabular-nums`}>
                        {formatWalletAmount(row.balanceAfter, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-lg border border-ink/10 md:hidden">
              {rows.map((row) => (
                <li key={row.id} className="space-y-1 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-navy">{row.purposeLabel || 'Wallet transaction'}</p>
                    <p className={`text-sm font-semibold whitespace-nowrap tabular-nums ${row.credit ? 'text-green' : 'text-[#9F1C26]'}`}>
                      {row.credit ? '+ ' : '− '}
                      {formatWalletAmount(row.amount, currency)}
                    </p>
                  </div>
                  {row.description ? <p className="text-[13px] leading-5 text-ink/60">{row.description}</p> : null}
                  <p className="text-xs text-ink/45">
                    {formatWalletWhen(row.createdAt)}
                    {row.balanceAfter ? ` · Balance ${formatWalletAmount(row.balanceAfter, currency)}` : ''}
                  </p>
                </li>
              ))}
            </ul>

            <PageBar
              page={history.data?.page ?? page}
              lastPage={lastPage}
              total={history.data?.total ?? 0}
              perPage={history.data?.perPage ?? WALLET_PAGE_SIZE}
              onPage={setPage}
              label="Transaction pages"
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
