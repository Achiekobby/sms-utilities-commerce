import { Hash, Users } from 'lucide-react'
import { GroupChoices } from '../../../../components/form/GroupChoices'
import { formatCount } from '../../dashboard/format'
import { activeRecipients, kindLabel, messageKinds, parseNumberList } from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none transition-all duration-200 placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'
const errorColor = '#E0232E'

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
      {children}
    </p>
  )
}

export function AudienceFields({ groups, values, errors, onChange }) {
  const parsed = parseNumberList(values.numbers)
  const selected = groups.filter((group) => values.groupIds.includes(group.id))

  function toggleGroup(id) {
    const next = values.groupIds.includes(id)
      ? values.groupIds.filter((item) => item !== id)
      : [...values.groupIds, id]
    onChange('groupIds', next)
  }

  return (
    <div>
      <h2 className="text-base font-bold text-navy">Who receives it</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
        Send to numbers you type, or to contact groups. Pending, unsubscribed, and blocked contacts stay out of a group send.
      </p>

      <fieldset className="mt-5">
        <legend className="sr-only">How to choose recipients</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {messageKinds.map((kind) => {
            const checked = values.kind === kind.id
            const Icon = kind.id === 'groups' ? Users : Hash
            return (
              <label
                key={kind.id}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-colors duration-200 ${focusClass} ${
                  checked ? 'border-green bg-mint/10 ring-4 ring-green/15' : 'border-ink/12 hover:border-green/40'
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="kind"
                    value={kind.id}
                    checked={checked}
                    onChange={() => onChange('kind', kind.id)}
                    className="sr-only"
                  />
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${checked ? 'bg-green text-white' : 'bg-mint/15 text-green'}`}>
                    <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-navy">{kind.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-ink/55">{kind.hint}</span>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {values.kind === 'numbers' ? (
        <div id="message-numbers" className="mt-5 scroll-mt-28">
          <label htmlFor="message-numbers-input" className="mb-2 block text-sm font-medium text-navy">
            Numbers
          </label>
          <textarea
            id="message-numbers-input"
            name="numbers"
            rows={6}
            value={values.numbers}
            placeholder="024 123 4567, 020 555 0101, 055 100 2000"
            aria-invalid={errors.numbers ? true : undefined}
            aria-describedby={errors.numbers ? 'message-numbers-count message-numbers-error' : 'message-numbers-count'}
            onChange={(event) => onChange('numbers', event.target.value)}
            className={`${field} py-3`}
          />
          <p id="message-numbers-count" className="mt-1.5 text-xs text-ink/55">
            {parsed.valid.length === 0
              ? 'Separate numbers with commas.'
              : `${formatCount(parsed.valid.length)} ${parsed.valid.length === 1 ? 'number' : 'numbers'} ready`}
            {parsed.duplicates
              ? ` · ${formatCount(parsed.duplicates)} ${parsed.duplicates === 1 ? 'repeat' : 'repeats'} will be sent once`
              : ''}
            {parsed.invalid.length ? ` · ${formatCount(parsed.invalid.length)} to check` : ''}
          </p>
          <FieldError id="message-numbers-error">{errors.numbers}</FieldError>
        </div>
      ) : (
        <fieldset id="message-groups" className="mt-5 scroll-mt-28">
          <legend className="text-sm font-medium text-navy">Contact groups</legend>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            Someone in two groups is counted twice. {selected.length ? `${formatCount(activeRecipients(selected))} active contacts selected.` : 'Select at least one group.'}
          </p>
          <GroupChoices groups={groups} groupIds={values.groupIds} onToggle={toggleGroup} />
          <FieldError id="message-groups-error">{errors.groupIds}</FieldError>
        </fieldset>
      )}

      <p className="sr-only">{kindLabel(values.kind)}</p>
    </div>
  )
}
