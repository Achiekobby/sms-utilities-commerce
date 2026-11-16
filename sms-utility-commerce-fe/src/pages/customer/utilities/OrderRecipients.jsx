import { Plus, Smartphone, UsersRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { localPhone } from '../../../features/contacts/contact'
import { paths } from '../../../routes/paths'
import { useGetContactGroupsQuery } from '../../../services/api/contacts/contactsApi'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
export const RECIPIENT_CAP = 50

function FieldLabel({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
      <Icon size={15} strokeWidth={2.2} className="text-ink/45" aria-hidden="true" />
      {children}
    </span>
  )
}

function FieldHint({ children }) {
  return <span className="mt-1 block text-[12px] leading-5 text-ink/45">{children}</span>
}

export function recipientPhones(rows) {
  const seen = new Set()
  const list = []
  for (const row of Array.isArray(rows) ? rows : []) {
    const phone = localPhone(row)
    if (!phone || seen.has(phone)) continue
    seen.add(phone)
    list.push(phone)
  }
  return list
}

export function linkRecipient(rows, previous, phone) {
  const current = Array.isArray(rows) && rows.length ? [...rows] : ['']
  const index = previous
    ? current.findIndex((row) => row === previous || localPhone(row) === previous)
    : -1
  if (!phone) {
    if (index === -1) return current
    const next = current.filter((_, item) => item !== index)
    return next.length ? next : ['']
  }
  if (index >= 0) {
    current[index] = phone
    return current
  }
  if (current.some((row) => localPhone(row) === phone)) return current
  const empty = current.findIndex((row) => !String(row).replace(/\D/g, ''))
  if (empty >= 0) {
    current[empty] = phone
    return current
  }
  if (current.length >= RECIPIENT_CAP) return current
  return [...current, phone]
}

export function OrderRecipients({
  audience,
  onAudience,
  numbers,
  onNumbers,
  groupIds,
  onGroupIds,
  verifiedContacts,
  sameAsMomo,
  momoPhone,
  showSame = false,
  onSameAsMomo,
}) {
  const [touched, setTouched] = useState({})
  const [query, setQuery] = useState('')
  const listRef = useRef(null)
  const countRef = useRef(numbers.length)
  const phones = recipientPhones(numbers)

  useEffect(() => {
    if (numbers.length <= countRef.current) {
      countRef.current = numbers.length
      return
    }
    countRef.current = numbers.length
    const inputs = listRef.current?.querySelectorAll('input')
    inputs?.[inputs.length - 1]?.focus()
  }, [numbers.length])
  const groupsQuery = useGetContactGroupsQuery(undefined, { skip: audience !== 'groups' })
  const groups = groupsQuery.data ?? []
  const visible = groups.filter((group) => group.name.toLowerCase().includes(query.trim().toLowerCase()))

  function changeRow(index, value) {
    const next = [...numbers]
    next[index] = value.replace(/\D/g, '')
    onNumbers(next)
  }

  function removeRow(index) {
    const next = numbers.filter((_, item) => item !== index)
    onNumbers(next.length ? next : [''])
  }

  return (
    <div className="mt-4">
      <FieldLabel icon={audience === 'groups' ? UsersRound : Smartphone}>Recipients</FieldLabel>
      <FieldHint>
        {audience === 'groups'
          ? 'Send this order to everyone in the groups you pick.'
          : 'Enter one number per field. Add another for the next recipient.'}
      </FieldHint>
      <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="How to choose recipients">
        {[
          ['numbers', 'Phone numbers', Smartphone],
          ['groups', 'Contact groups', UsersRound],
        ].map(([id, name, Icon]) => {
          const selected = audience === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onAudience(id)}
              className={`inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold ${focusClass} ${
                selected ? 'border-navy bg-navy text-white' : 'border-[#E3ECF7] bg-white text-navy'
              }`}
            >
              <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
              {name}
            </button>
          )
        })}
      </div>

      {audience === 'numbers' ? (
        <div className="mt-3">
          <ul ref={listRef} className="space-y-2">
            {numbers.map((value, index) => {
              const phone = localPhone(value)
              const duplicate = phone && numbers.slice(0, index).some((row) => localPhone(row) === phone)
              const invalid = touched[index] && value && !phone
              return (
                <li key={index}>
                  <label className="block">
                    <span className="sr-only">Recipient {index + 1}</span>
                    <span className="flex h-12 items-center rounded-xl border border-ink/10 bg-canvas px-3 focus-within:border-navy">
                      <input
                        inputMode="numeric"
                        value={value}
                        onChange={(event) => changeRow(index, event.target.value)}
                        onBlur={() => setTouched((current) => ({ ...current, [index]: true }))}
                        placeholder="0240000000"
                        className={`h-full w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:font-medium placeholder:text-ink/35 ${focusClass}`}
                      />
                      {numbers.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`Remove recipient ${index + 1}`}
                          onClick={() => removeRow(index)}
                          className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/45 hover:bg-white hover:text-navy ${focusClass}`}
                        >
                          <X size={15} aria-hidden="true" />
                        </button>
                      ) : null}
                    </span>
                  </label>
                  {duplicate ? (
                    <p className="mt-1 text-[12px] text-[#9F1C26]">This number is already added.</p>
                  ) : invalid ? (
                    <p className="mt-1 text-[12px] text-[#9F1C26]">Use 10 digits, starting with 0.</p>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            disabled={numbers.length >= RECIPIENT_CAP}
            onClick={() => onNumbers([...numbers, ''])}
            className={`mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
          >
            <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
            Add another
          </button>
          <p className="mt-1.5 text-[12px] text-ink/45">
            {phones.length} of {RECIPIENT_CAP} numbers.
          </p>
          {showSame ? (
            <button
              type="button"
              disabled={!localPhone(momoPhone)}
              aria-pressed={sameAsMomo}
              onClick={onSameAsMomo}
              className={`mt-2 inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${focusClass} ${
                sameAsMomo ? 'text-green' : 'text-navy'
              }`}
            >
              <span
                className={`flex size-4 items-center justify-center rounded border ${
                  sameAsMomo ? 'border-green bg-green text-white' : 'border-[#D5E0EE] bg-white'
                }`}
                aria-hidden="true"
              >
                {sameAsMomo ? <span className="size-1.5 rounded-full bg-white" /> : null}
              </span>
              Buy for the same number
            </button>
          ) : null}
          {showSame && !localPhone(momoPhone) ? (
            <FieldHint>Enter a mobile money number first, then you can reuse it here.</FieldHint>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">
          {verifiedContacts ? (
            <FieldHint>YELLO only includes verified contacts in the groups you choose.</FieldHint>
          ) : (
            <FieldHint>The people in the selected groups receive this order.</FieldHint>
          )}
          {groupsQuery.isLoading ? <span className="skeleton mt-3 block h-16 rounded-xl" /> : null}
          {groupsQuery.isError ? (
            <p className="mt-2 text-sm text-[#9F1C26]" role="alert">
              Contact groups could not be loaded.
            </p>
          ) : null}
          {groupsQuery.isSuccess && !groups.length ? (
            <p className="mt-2 text-sm text-ink/60">
              You have no contact groups yet.{' '}
              <Link to={paths.contacts} className="font-semibold text-navy underline">
                Create one
              </Link>
            </p>
          ) : null}
          {groups.length > 6 ? (
            <label className="mt-2 block">
              <span className="sr-only">Search groups</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search groups"
                className={`h-11 w-full rounded-xl border border-ink/10 bg-canvas px-3 text-sm font-semibold text-navy outline-none placeholder:font-medium placeholder:text-ink/35 focus:border-navy ${focusClass}`}
              />
            </label>
          ) : null}
          {visible.length ? (
            <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto">
              {visible.map((group) => {
                const selected = groupIds.includes(group.id)
                return (
                  <li key={group.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onGroupIds(selected ? groupIds.filter((id) => id !== group.id) : [...groupIds, group.id])
                      }
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left ${focusClass} ${
                        selected ? 'border-navy bg-[#F3F6FB]' : 'border-[#E3ECF7] bg-white'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-navy">{group.name}</span>
                        <span className="text-[12px] text-ink/45">
                          {group.count} {group.count === 1 ? 'contact' : 'contacts'}
                        </span>
                      </span>
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                          selected ? 'border-green bg-green' : 'border-[#D5E0EE] bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  )
}
