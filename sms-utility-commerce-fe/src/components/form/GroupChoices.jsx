import { formatCount } from '../../pages/customer/dashboard/format'
import { ChoiceEmpty, ChoicePager, ChoiceSearch, useChoicePage } from './ChoiceList'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const pageSize = 6

export function GroupChoices({ groups, groupIds, onToggle }) {
  const ordered = [...groups].sort((a, b) => b.breakdown.active - a.breakdown.active || a.name.localeCompare(b.name))
  const choices = useChoicePage(ordered, {
    pageSize,
    matches: (group, term) => `${group.name} ${group.description ?? ''}`.toLowerCase().includes(term),
  })

  return (
    <div>
      <ChoiceSearch
        label="Search contact groups"
        placeholder="Search groups"
        value={choices.query}
        onChange={choices.search}
      />
      {choices.pageItems.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {choices.pageItems.map((group) => {
            const active = group.breakdown.active
            const disabled = active < 1
            const checked = groupIds.includes(group.id)
            return (
              <label
                key={group.id}
                className={`flex items-center gap-3 rounded-xl border-2 bg-white p-3 transition-colors duration-200 ${
                  disabled
                    ? 'cursor-not-allowed border-ink/10 opacity-60'
                    : `cursor-pointer hover:border-green/40 ${focusClass} ${
                        checked ? 'border-green bg-mint/10 ring-4 ring-green/15' : 'border-ink/15'
                      }`
                }`}
              >
                <input
                  type="checkbox"
                  name="groupIds"
                  value={group.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(group.id)}
                  className="size-4 shrink-0 accent-blue"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy">{group.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink/55">{group.description}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold text-navy tabular-nums">{formatCount(active)}</span>
                  <span className="block text-xs text-ink/50">{disabled ? 'None active' : 'Active'}</span>
                </span>
              </label>
            )
          })}
        </div>
      ) : (
        <ChoiceEmpty term={choices.term} noun="groups" />
      )}
      <ChoicePager label="Contact group pages" noun="groups" pager={choices.pager} total={choices.filtered.length} />
    </div>
  )
}
