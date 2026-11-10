import { Building2, Cake, CalendarClock, Gift, Mail, Phone, Send, Signal, User, UserRound, Users, Wallet } from 'lucide-react'
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
import { ctaInsertText } from '../cta'
import { insertRewardCopy, rewardPlaceholders } from '../reward'
import { PromotionCtaSection } from './PromotionCtaSection'

const placeholderIcons = {
  firstName: UserRound,
  lastName: User,
  fullName: Users,
  phone: Phone,
  email: Mail,
  businessName: Building2,
  birthday: Cake,
  rewardType: Gift,
  rewardAmount: Wallet,
  bundleSize: Signal,
}

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

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

export function MessageStep({
  values,
  errors,
  onChange,
  nameLabel = 'Campaign name',
  senders = [],
  sendersLoading = false,
  sendersError = '',
  onRetrySenders,
  allowSchedule = true,
  showPlaceholders = true,
  showName = true,
  showType = true,
}) {
  const type = campaignTypes.find((item) => item.id === values.type) ?? campaignTypes[0]
  const segments = segmentCount(values.body)
  const over = segments > maxSegments
  const earliest = localDateTimeValue(new Date())
  const rewardVars = rewardPlaceholders(values.reward)
  const placeholders = [...messagePlaceholders, ...rewardVars]
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

  function insertRewardDetails() {
    const copy = insertRewardCopy(values.reward)
    if (!copy) return
    insertPlaceholder(copy)
  }

  function insertCtaDetails() {
    const copy = ctaInsertText(values.cta)
    if (!copy) return
    insertPlaceholder(copy)
  }

  return (
    <div className="flex flex-col gap-1">
      <div>
        <h2 className="text-base font-bold text-navy">The message</h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
          One SMS is 160 characters. Longer messages split into segments of 153.
        </p>
      </div>

      {showName ? (
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
      ) : null}

      {showType ? (
        <fieldset id="campaign-type" className={`${showName ? '' : 'mt-5 '}scroll-mt-28`}>
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
          {values.type === 'other' ? (
            <div id="campaign-custom-type" className="mt-3 scroll-mt-28">
              <label htmlFor="campaign-custom-type-input" className={labelClass}>
                Custom type
              </label>
              <input
                id="campaign-custom-type-input"
                name="customType"
                value={values.customType ?? ''}
                placeholder="e.g. Appointment reminder"
                maxLength={40}
                aria-invalid={errors.customType ? true : undefined}
                aria-describedby={errors.customType ? 'campaign-custom-type-error' : undefined}
                onChange={(event) => onChange('customType', event.target.value)}
                className={`${field} h-12`}
              />
              <FieldError id="campaign-custom-type-error">{errors.customType}</FieldError>
            </div>
          ) : null}
          <FieldError id="campaign-type-error">{errors.type}</FieldError>
        </fieldset>
      ) : null}

      <fieldset id="campaign-sender" className="scroll-mt-28">
        <legend className={labelClass}>Sender</legend>
        <p className="text-xs leading-5 text-ink/55">
          {values.sender ? `Sending as ${values.sender}.` : 'Choose an approved sender ID.'}
        </p>
        {sendersLoading ? <p className="mt-3 text-sm text-ink/55">Loading sender IDs…</p> : null}
        {sendersError ? (
          <div className="mt-3 rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-3 py-3">
            <p className="text-sm text-[#9F1C26]">{sendersError}</p>
            {onRetrySenders ? (
              <button
                type="button"
                onClick={onRetrySenders}
                className="mt-2 text-sm font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                Try again
              </button>
            ) : null}
          </div>
        ) : null}
        {!sendersLoading && !sendersError ? (
          <>
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
          </>
        ) : null}
        <FieldError id="campaign-sender-error">{errors.sender}</FieldError>
      </fieldset>

      <div id="campaign-body" className="scroll-mt-28">
        <label htmlFor="campaign-body-input" className={labelClass}>
          Message
        </label>
        {showPlaceholders ? (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Insert a placeholder">
              {placeholders.map((item) => {
                const Icon = placeholderIcons[item.id] ?? Gift
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => insertPlaceholder(item.token)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-2.5 text-xs font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
                  >
                    <Icon size={13} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
                    {item.label}
                    <span className="font-mono text-[11px] font-medium text-ink/45">{item.token}</span>
                  </button>
                )
              })}
              {values.reward?.enabled ? (
                <button
                  type="button"
                  onClick={insertRewardDetails}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue/25 bg-blue/[0.06] px-2.5 text-xs font-semibold text-blue transition-colors hover:bg-blue/[0.1] ${focusClass}`}
                >
                  <Gift size={13} strokeWidth={2.2} aria-hidden="true" />
                  Insert reward details
                </button>
              ) : null}
            </div>
            <p className="mb-2 text-xs leading-5 text-ink/55">Each contact gets their own value. A missing field is left blank.</p>
          </>
        ) : (
          <p className="mb-2 text-xs leading-5 text-ink/55">This text is sent as written to every number.</p>
        )}
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

      {values.type === 'promotion' ? (
        <PromotionCtaSection
          values={values}
          errors={errors}
          onChange={onChange}
          onInsertIntoMessage={insertCtaDetails}
        />
      ) : null}

      {allowSchedule ? (
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
      ) : null}
    </div>
  )
}
