const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'h-10 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-navy outline-none transition-colors hover:border-blue/35 focus:border-blue'

const transactionTypes = [
  { id: '', label: 'All types' },
  { id: 'credit', label: 'Credit' },
  { id: 'debit', label: 'Debit' },
]

const transactionPurposes = [
  { id: '', label: 'All purposes' },
  { id: 'wallet_top_up', label: 'Wallet top-up' },
  { id: 'utility_bulk', label: 'Utility purchase' },
]

export function WalletListFilters({
  label,
  search,
  from,
  to,
  type,
  purpose,
  showType = false,
  showPurpose = false,
  onChange,
  onClear,
}) {
  const dirty = Boolean(search || from || to || type || purpose)

  return (
    <form
      role="search"
      aria-label={label}
      onSubmit={(event) => event.preventDefault()}
      className="mt-4 grid gap-3 rounded-xl border border-[#D8E7FA] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="block min-w-0 sm:col-span-2 lg:col-span-2">
        <span className="mb-1.5 block text-[12px] font-medium text-ink/55">Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search description"
          className={`${field} ${focusClass}`}
        />
      </label>
      <label className="block min-w-0">
        <span className="mb-1.5 block text-[12px] font-medium text-ink/55">From</span>
        <input type="date" value={from} onChange={(event) => onChange({ from: event.target.value })} className={`${field} ${focusClass}`} />
      </label>
      <label className="block min-w-0">
        <span className="mb-1.5 block text-[12px] font-medium text-ink/55">To</span>
        <input type="date" value={to} onChange={(event) => onChange({ to: event.target.value })} className={`${field} ${focusClass}`} />
      </label>
      {showType ? (
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[12px] font-medium text-ink/55">Type</span>
          <select value={type} onChange={(event) => onChange({ type: event.target.value })} className={`${field} ${focusClass}`}>
            {transactionTypes.map((option) => (
              <option key={option.id || 'all-types'} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {showPurpose ? (
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[12px] font-medium text-ink/55">Purpose</span>
          <select value={purpose} onChange={(event) => onChange({ purpose: event.target.value })} className={`${field} ${focusClass}`}>
            {transactionPurposes.map((option) => (
              <option key={option.id || 'all-purposes'} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex items-end">
        <button
          type="button"
          onClick={onClear}
          disabled={!dirty}
          className={`inline-flex h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-45 ${focusClass}`}
        >
          Clear
        </button>
      </div>
    </form>
  )
}
