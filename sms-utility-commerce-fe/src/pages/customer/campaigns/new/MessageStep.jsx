import { Building2, CalendarClock, Mail, Phone, Send, User, UserRound, Users } from 'lucide-react'
import { useRef } from 'react'
import { ChoiceEmpty, ChoicePager, ChoiceSearch, useChoicePage } from '../../../../components/form/ChoiceList'
import { typeIcons } from '../../../../components/TypeBadge'
import {
  campaignTypes,
  localDateTimeValue,
  maxBodyLength,
  maxSegments,
  messagePlaceholders,
  segmentCount,
} from '../model'

const placeholderIcons = {
  firstName: UserRound,
  lastName: User,
  fullName: Users,
  phone: Phone,
  email: Mail,
  businessName: Building2,
}

const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none transition-all duration-200 placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'
const labelClass = 'mb-2 block text-sm font-medium text-navy'
const errorColor = '#E0232E'

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
      {children}
    </p>
  )
}

export function MessageStep({ values, errors, onChange, nameLabel = 'Campaign name', senders = [] }) {
  const type = campaignTypes.find((item) => item.id === values.type) ?? campaignTypes[0]
  const segments = segmentCount(values.body)
  const over = segments > maxSegments
  const earliest = localDateTimeValue(new Date())
  const senderChoices = useChoicePage(senders, {
    pageSize: 6,
    matches: (sender, term) => sender.toLowerCase().includes(term),
  })
  const bodyRef = useRef(null)

  function insertPlaceholder(token) {
    const field = bodyRef.current
    const start = field?.selectionStart ?? values.body.length
    const end = field?.selectionEnd ?? values.body.length
    const before = values.body.slice(0, start)
    const gap = before.length > 0 && !/\s$/.test(before) ? ' ' : ''
    const insert = `${gap}${token}`
    const next = `${before}${insert}${values.body.slice(end)}`.slice(0, maxBodyLength)
    onChange('body', next)
    const cursor = Math.min(start + insert.length, next.length)
    requestAnimationFrame(() => {
      field?.focus()
      field?.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div>
        <h2 className="text-base font-bold text-navy">The message</h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
          One SMS is 160 characters. Longer messages split into segments of 153.
        </p>
      </div>

      <div id="campaign-name" className="mt-5 scroll-mt-28">
        <label htmlFor="campaign-name-input" className={labelClass}>
          {nameLabel}
        </label>
        <input
          id="campaign-name-input"
          name="name"
          value={values.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'campaign-name-error' : undefined}
          onChange={(event) => onChange('name', event.target.value)}
          className={`${field} h-12`}
        />
        <FieldError id="campaign-name-error">{errors.name}</FieldError>
      </div>

      <fieldset id="campaign-type" className="scroll-mt-28">
        <legend className={labelClass}>Type</legend>
        <div className="flex flex-wrap gap-2">
          {campaignTypes.map((item) => {
            const checked = values.type === item.id
            const Icon = typeIcons[item.id]
            return (
              <label
                key={item.id}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                  checked ? 'border-blue bg-blue/[0.06] text-blue' : 'border-ink/15 text-navy hover:border-blue/40'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={item.id}
                  checked={checked}
                  onChange={() => onChange('type', item.id)}
                  className="sr-only"
                />
                {Icon ? <Icon size={15} strokeWidth={2.2} aria-hidden="true" /> : null}
                {item.label}
              </label>
            )
          })}
        </div>
        <p className="mt-2 text-xs leading-5 text-ink/55">{type.hint}</p>
        <FieldError id="campaign-type-error">{errors.type}</FieldError>
      </fieldset>

      <fieldset id="campaign-sender" className="scroll-mt-28">
        <legend className={labelClass}>Sender</legend>
        <p className="text-xs leading-5 text-ink/55">Sending as {values.sender}.</p>
        <ChoiceSearch
          label="Search sender IDs"
          placeholder="Search sender IDs"
          value={senderChoices.query}
          onChange={senderChoices.search}
        />
        {senderChoices.pageItems.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {senderChoices.pageItems.map((sender) => {
              const checked = values.sender === sender
              return (
                <label
                  key={sender}
                  className={`cursor-pointer rounded-lg border px-3 py-2 font-mono text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    checked ? 'border-navy bg-navy text-white' : 'border-ink/15 text-navy hover:border-blue/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="sender"
                    value={sender}
                    checked={checked}
                    onChange={() => onChange('sender', sender)}
                    className="sr-only"
                  />
                  {sender}
                </label>
              )
            })}
          </div>
        ) : (
          <ChoiceEmpty term={senderChoices.term} noun="sender IDs" />
        )}
        <ChoicePager
          label="Sender ID pages"
          noun="sender IDs"
          pager={senderChoices.pager}
          total={senderChoices.filtered.length}
        />
        <FieldError id="campaign-sender-error">{errors.sender}</FieldError>
      </fieldset>

      <div id="campaign-body" className="scroll-mt-28">
        <label htmlFor="campaign-body-input" className={labelClass}>
          Message
        </label>
        <div className="mb-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Insert a placeholder">
          {messagePlaceholders.map((item) => {
            const Icon = placeholderIcons[item.id]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => insertPlaceholder(item.token)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-2.5 text-xs font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <Icon size={13} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
                {item.label}
                <span className="font-mono text-[11px] font-medium text-ink/45">{item.token}</span>
              </button>
            )
          })}
        </div>
        <p className="mb-2 text-xs leading-5 text-ink/55">Each contact gets their own value. A missing field is left blank.</p>
        <textarea
          ref={bodyRef}
          id="campaign-body-input"
          name="body"
          rows={5}
          maxLength={maxBodyLength}
          value={values.body}
          placeholder={type.placeholder}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? 'campaign-body-count campaign-body-error' : 'campaign-body-count'}
          onChange={(event) => onChange('body', event.target.value)}
          className={`${field} py-3`}
        />
        <p
          id="campaign-body-count"
          className={`mt-1.5 text-xs tabular-nums ${over ? 'font-medium' : 'text-ink/55'}`}
          style={over ? { color: errorColor } : undefined}
        >
          {values.body.length} characters · {segments} {segments === 1 ? 'segment' : 'segments'}
        </p>
        <FieldError id="campaign-body-error">{errors.body}</FieldError>
      </div>

      <fieldset id="campaign-sendAt" className="scroll-mt-28">
        <legend className={labelClass}>When to send</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { id: 'now', label: 'Send now', icon: Send },
            { id: 'later', label: 'Schedule', icon: CalendarClock },
          ].map((item) => {
            const checked = values.when === item.id
            const Icon = item.icon
            return (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors duration-200 ${
                  checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                }`}
              >
                <input
                  type="radio"
                  name="when"
                  value={item.id}
                  checked={checked}
                  onChange={() => {
                    onChange('when', item.id)
                    if (item.id === 'now') onChange('sendAt', '')
                  }}
                  className="sr-only"
                />
                <Icon size={16} strokeWidth={2.2} aria-hidden="true" className={checked ? 'text-blue' : 'text-ink/55'} />
                {item.label}
              </label>
            )
          })}
        </div>
        {values.when === 'later' ? (
          <div className="mt-3">
            <label htmlFor="campaign-send-at-input" className="sr-only">
              Date and time
            </label>
            <input
              id="campaign-send-at-input"
              type="datetime-local"
              name="sendAt"
              min={earliest}
              value={values.sendAt}
              aria-invalid={errors.sendAt ? true : undefined}
              aria-describedby={errors.sendAt ? 'campaign-send-at-error' : undefined}
              onChange={(event) => onChange('sendAt', event.target.value)}
              className={`${field} h-12`}
            />
            <FieldError id="campaign-send-at-error">{errors.sendAt}</FieldError>
          </div>
        ) : null}
      </fieldset>
    </div>
  )
}
