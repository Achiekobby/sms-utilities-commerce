import { Gift, Phone, Search, Signal, Wallet } from 'lucide-react'
import { useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/client'
import {
  formatRewardPrice,
  rewardStatusOptions,
  rewardTypeLabel,
  rewardTypeOptions,
} from '../../../features/rewards/rewardRecord'
import { telcoMark } from '../../../features/utilities/utilityModel'
import { useGetRewardsCatalogQuery, useGetRewardsQuery } from '../../../services/api/rewards/rewardsApi'
import { useDebouncedValue } from '../../../utils/hooks/useDebouncedValue'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { PageBar } from '../contacts/sections/PageBar'
import { formatCount } from '../dashboard/format'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const control =
  'h-10 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-navy outline-none transition-colors hover:border-blue/35 focus:border-blue'
const head =
  'border-b border-[#E1EAF6] bg-[#F3F7FD] px-4 py-3 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase'
const cell = 'border-b border-[#E7EEF8] px-4 py-3.5 align-middle text-sm text-ink/75'
const numeric = `${cell} text-right tabular-nums`
const tabs = [
  { id: 'rewards', label: 'My rewards' },
  { id: 'catalog', label: 'Catalog' },
]

const typeIcons = {
  money: Wallet,
  cash: Wallet,
  airtime: Phone,
  data: Signal,
}

function StatusBadge({ status, label }) {
  const key = String(status ?? '').toLowerCase()
  const tone =
    key === 'instock' || key === 'active'
      ? 'bg-[#E5F6EC] text-green'
      : key === 'outofstock' || key === 'inactive'
        ? 'bg-[#FDECEE] text-[#9F1C26]'
        : 'bg-[#F3F6FB] text-navy'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {label || status || '—'}
    </span>
  )
}

function PackageLogo({ network }) {
  const mark = telcoMark(network)
  if (!mark.image) return null
  const wide = mark.fit === 'contain'
  return (
    <span
      className={`flex h-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ${wide ? 'w-14' : 'w-9'}`}
      style={wide ? { backgroundColor: mark.color } : undefined}
    >
      <img src={mark.image} alt="" className={wide ? 'h-auto w-full' : 'size-full object-cover'} />
    </span>
  )
}

function TypeChip({ type }) {
  const Icon = typeIcons[type] ?? Gift
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F6FB] px-2 py-1 text-xs font-semibold text-navy">
      <Icon size={13} strokeWidth={2.2} aria-hidden="true" />
      {rewardTypeLabel(type)}
    </span>
  )
}

function FilterField({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[12px] font-medium leading-4 text-ink/55">{label}</span>
      {children}
    </label>
  )
}

function RewardsList() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const search = useDebouncedValue(query.trim())
  const list = useGetRewardsQuery({ page, perPage: pageSize, search, type, status })
  const rows = list.data?.rows ?? []
  const total = list.data?.total ?? 0
  const lastPage = Math.max(1, list.data?.lastPage ?? 1)
  const currentPage = Math.min(page, lastPage)
  const filtered = Boolean(query.trim() || type || status)

  function resetPage() {
    setPage(1)
  }

  return (
    <section aria-label="Client rewards" className="mt-6 overflow-hidden rounded-2xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
      <form
        role="search"
        aria-label="Filter rewards"
        onSubmit={(event) => event.preventDefault()}
        className="grid items-end gap-3 border-b border-[#E7EEF8] bg-[#F8FBFF] p-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1.4fr)_11rem_11rem_auto]"
      >
        <FilterField label="Search">
          <span className="relative block">
            <Search size={16} strokeWidth={2.2} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                resetPage()
              }}
              placeholder="Name or network"
              className={`${control} pl-9 ${focusClass}`}
            />
          </span>
        </FilterField>
        <FilterField label="Type">
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value)
              resetPage()
            }}
            className={`${control} ${focusClass}`}
          >
            {rewardTypeOptions.map((option) => (
              <option key={option.id || 'all-types'} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Status">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              resetPage()
            }}
            className={`${control} ${focusClass}`}
          >
            {rewardStatusOptions.map((option) => (
              <option key={option.id || 'all-status'} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
        <div className="flex items-end sm:col-span-2 xl:col-span-1">
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setType('')
              setStatus('')
              resetPage()
            }}
            disabled={!filtered}
            className={`h-10 w-full rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 xl:w-auto ${focusClass}`}
          >
            Clear
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-[13px] text-ink/55 tabular-nums">
          {formatCount(total)} {total === 1 ? 'reward' : 'rewards'}
        </p>
      </div>

      {list.isLoading ? (
        <div role="status" className="space-y-2 px-4 pb-4">
          <span className="sr-only">Loading rewards</span>
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="skeleton block h-12 rounded-lg" />
          ))}
        </div>
      ) : list.isError ? (
        <div role="alert" className="mx-4 mb-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(list.error)}</p>
          <button type="button" onClick={list.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mx-4 mb-4 rounded-xl border border-dashed border-ink/15 px-5 py-10 text-center">
          <Gift className="mx-auto text-ink/30" size={28} strokeWidth={1.8} aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-navy">{filtered ? 'No rewards match these filters' : 'No rewards yet'}</p>
          <p className="mt-1 text-sm text-ink/55">Rewards on your account show up in this list.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th scope="col" className={head}>Reward</th>
                  <th scope="col" className={head}>Type</th>
                  <th scope="col" className={head}>Network</th>
                  <th scope="col" className={head}>Size</th>
                  <th scope="col" className={`${head} text-right`}>Amount</th>
                  <th scope="col" className={`${head} text-right`}>Price</th>
                  <th scope="col" className={head}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((reward) => (
                  <tr key={reward.id} className="transition-colors hover:bg-[#F7FAFD]">
                    <th scope="row" className={`${cell} text-left font-semibold text-navy`}>
                      <span className="flex items-center gap-3">
                        <PackageLogo network={reward.network} />
                        <span className="min-w-0">
                          <span className="block">{reward.name}</span>
                          <span className="mt-0.5 block text-[12px] font-medium text-ink/40">ID {reward.id}</span>
                        </span>
                      </span>
                    </th>
                    <td className={cell}>
                      <TypeChip type={reward.type} />
                    </td>
                    <td className={cell}>{reward.network || '—'}</td>
                    <td className={cell}>{reward.size || '—'}</td>
                    <td className={`${numeric} font-medium text-navy`}>{formatRewardPrice(reward.amount, reward.currency)}</td>
                    <td className={`${numeric} font-medium text-navy`}>{formatRewardPrice(reward.price, reward.currency)}</td>
                    <td className={cell}>
                      <StatusBadge status={reward.status} label={reward.statusLabel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#E7EEF8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-[13px] text-ink/60">
              Rows
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  resetPage()
                }}
                className={`${control} w-[4.5rem] ${focusClass}`}
              >
                {[6, 12, 24].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <PageBar
              page={currentPage}
              lastPage={lastPage}
              total={total}
              perPage={pageSize}
              onPage={setPage}
              label="Rewards pages"
              className="mt-0"
              always
            />
          </div>
        </>
      )}
    </section>
  )
}

function CatalogPanel() {
  const catalog = useGetRewardsCatalogQuery()
  const data = catalog.data

  if (catalog.isLoading) {
    return (
      <div role="status" className="mt-6 space-y-2">
        <span className="sr-only">Loading catalog</span>
        {Array.from({ length: 3 }, (_, index) => (
          <span key={index} className="skeleton block h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (catalog.isError) {
    return (
      <div role="alert" className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#9F1C26]">{apiErrorMessage(catalog.error)}</p>
        <button type="button" onClick={catalog.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-blue" aria-hidden="true" />
          <h2 className="text-base font-bold text-navy">Airtime</h2>
        </div>
        <p className="mt-1 text-sm text-ink/55">Networks and preset amounts you can offer as rewards.</p>
          <ul className="mt-4 space-y-2">
          {(data?.airtime.networks ?? []).map((network) => (
            <li key={network.code} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7FAFD] px-3 py-2.5 text-sm">
              <span className="flex min-w-0 items-center gap-3 font-semibold text-navy">
                <PackageLogo network={network.code} />
                {network.name}
              </span>
              <span className="shrink-0 tabular-nums text-ink/55">
                {formatRewardPrice(network.minAmount, data.currency)} – {formatRewardPrice(network.maxAmount, data.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {(data?.airtime.presets ?? []).map((amount) => (
            <span key={amount} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-semibold text-navy">
              {formatRewardPrice(amount, data.currency)}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-green" aria-hidden="true" />
          <h2 className="text-base font-bold text-navy">Cash</h2>
        </div>
        <p className="mt-1 text-sm text-ink/55">Cash rewards are paid through mobile money.</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3 rounded-xl bg-[#F3FBF6] px-3 py-2.5">
            <dt className="text-ink/55">Currency</dt>
            <dd className="font-semibold text-navy">{data?.money.currency || data?.currency || 'GHS'}</dd>
          </div>
          <div className="flex justify-between gap-3 rounded-xl bg-[#F7FAFD] px-3 py-2.5">
            <dt className="text-ink/55">Method</dt>
            <dd className="font-semibold text-navy">Mobile money</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)] lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Signal size={16} className="text-navy" aria-hidden="true" />
            <h2 className="text-base font-bold text-navy">Data bundles</h2>
          </div>
          <StatusBadge
            status={data?.providerReachable ? 'instock' : 'outofstock'}
            label={data?.providerReachable ? 'Provider reachable' : 'Provider offline'}
          />
        </div>
        <p className="mt-1 text-sm text-ink/55">
          Live data plans come from the rewards catalog when the provider is reachable.
        </p>
        {(data?.data.plans ?? []).length ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.plans.map((plan, index) => (
              <li key={plan.id || plan.package_id || index} className="flex items-center gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm">
                <PackageLogo network={plan.network || plan.name} />
                <span className="min-w-0">
                  <p className="font-semibold text-navy">{plan.name || plan.label || 'Data plan'}</p>
                  <p className="mt-1 text-ink/55">{plan.size || plan.package_id || '—'}</p>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl bg-[#FFF8EB] px-4 py-3 text-sm text-[#8A4B08]">
            No data plans are available from the catalog right now.
          </p>
        )}
      </section>
    </div>
  )
}


export function RewardsPage() {
  useDocumentTitle('Rewards')
  const [tab, setTab] = useState('rewards')

  return (
    <div className="w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Rewards</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Cash, airtime, and data rewards on your account, plus the catalog they come from.
        </p>
      </header>

      <div role="tablist" aria-label="Rewards sections" className="mt-6 flex flex-wrap gap-1.5 rounded-xl bg-[#F3F6FB] p-1">
        {tabs.map((item) => {
          const selected = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={`h-9 rounded-lg px-3.5 text-sm font-semibold transition-colors ${focusClass} ${
                selected ? 'bg-white text-navy shadow-[0_1px_2px_rgba(16,33,61,0.08)]' : 'text-ink/60 hover:text-navy'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {tab === 'rewards' ? <RewardsList /> : null}
      {tab === 'catalog' ? <CatalogPanel /> : null}
    </div>
  )
}
