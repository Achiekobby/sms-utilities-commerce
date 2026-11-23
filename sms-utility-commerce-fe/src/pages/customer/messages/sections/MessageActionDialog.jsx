import { AlarmClock, CalendarClock, RotateCcw, Send } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { PlaceholderTextarea } from '../../../../components/PlaceholderTextarea'
import { formatCount } from '../../dashboard/format'
import { charsPerSmsUnit, messageFailedCount, smsSendUnits, smsUnitCount } from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const maxBodyLength = charsPerSmsUnit * 6
const field =
  'h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-navy outline-none transition-colors placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'

function earliestDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function MessageActionDialog({
  type,
  message,
  recipientCount,
  draft,
  onDraftChange,
  target = 'all',
  onTargetChange,
  when = 'now',
  onWhenChange,
  sendAt = '',
  onSendAtChange,
  sendTime = '',
  onSendTimeChange,
  senderMode = 'keep',
  onSenderModeChange,
  sender = '',
  onSenderChange,
  senders = [],
  sendersLoading = false,
  sendersError = '',
  onRetrySenders,
  lockTarget = false,
  lockWhen = false,
  errors = {},
  busy = false,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const reblast = type === 'reblast'
  const bulk = message?.kind === 'groups'
  const failedOnly = reblast && bulk && target === 'failed'
  const showSchedule = (!reblast && message?.kind === 'numbers') || (reblast && bulk && target === 'all')
  const showWhenPicker = showSchedule && !lockWhen
  const showScheduleFields = showSchedule && when === 'later'
  const showMessage = !failedOnly && !(reblast && bulk && when === 'later')
  const originalSender = String(message?.sender ?? '').trim()
  const Icon = reblast ? RotateCcw : when === 'later' ? CalendarClock : Send
  const characters = draft.length
  const unitsPerRecipient = failedOnly ? smsUnitCount(message?.body) : smsUnitCount(draft)
  const totalUnits = smsSendUnits({
    body: failedOnly ? message?.body : draft,
    recipients: recipientCount,
  })
  const failedCount = messageFailedCount(message)
  const senderChoices = senders.filter((name) => name && name !== originalSender)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    dialog.querySelector('[data-autofocus]')?.focus()
  }, [])

  const title = reblast
    ? bulk
      ? failedOnly
        ? 'Reblast failed recipients?'
        : when === 'later'
          ? 'Schedule a reblast?'
          : 'Reblast this bulk SMS?'
      : 'Reblast this quick SMS?'
    : when === 'later'
      ? 'Schedule a resend?'
      : 'Resend this quick SMS?'

  const description = reblast
    ? bulk
      ? failedOnly
        ? `Send the original message again to ${formatCount(recipientCount)} failed recipient${recipientCount === 1 ? '' : 's'}.`
        : when === 'later'
          ? `Schedule another send to all ${formatCount(recipientCount)} contact${recipientCount === 1 ? '' : 's'} in the original group(s).`
          : `Queue another send to all ${formatCount(recipientCount)} contact${recipientCount === 1 ? '' : 's'} in the original group(s).`
      : `Queue another quick SMS to the same ${formatCount(recipientCount)} number${recipientCount === 1 ? '' : 's'}.`
    : when === 'later'
      ? `Schedule another quick SMS to the same ${formatCount(recipientCount)} number${recipientCount === 1 ? '' : 's'}.`
      : `Queue another quick SMS to the same ${formatCount(recipientCount)} number${recipientCount === 1 ? '' : 's'}.`

  const confirmDisabled =
    busy ||
    (showMessage && !draft.trim()) ||
    (showSchedule && when === 'later' && (!sendAt || !sendTime)) ||
    (failedOnly && recipientCount < 1) ||
    (senderMode === 'keep' ? !originalSender : !String(sender ?? '').trim()) ||
    (senderMode === 'change' && sendersLoading)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy || undefined}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (busy) return
        if (event.target === event.currentTarget) onClose()
      }}
      className="confirm-dialog fixed inset-0 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100vw-1.5rem))] max-w-none flex-col overflow-hidden rounded-2xl bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_28px_72px_-16px_rgba(11,31,91,0.55)]"
    >
      <header className="shrink-0 border-b border-ink/10 px-6 pt-6 pb-4 sm:px-7 sm:pt-7">
        <div className="flex items-start gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#DDF3E6] text-green">
            <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-navy">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm leading-6 text-ink/70">
              {description}
            </p>
          </div>
        </div>
      </header>

      <div className="confirm-panel min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-7">
        {bulk && reblast && !lockTarget ? (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-navy">Audience</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { id: 'all', label: 'All contacts', detail: 'Everyone in the original group(s)' },
                {
                  id: 'failed',
                  label: 'Failed only',
                  detail:
                    failedCount > 0
                      ? `${formatCount(failedCount)} failed recipient${failedCount === 1 ? '' : 's'}`
                      : 'No failed recipients on this send',
                },
              ].map((item) => {
                const checked = target === item.id
                const disabled = item.id === 'failed' && failedCount < 1
                return (
                  <label
                    key={item.id}
                    className={`rounded-xl border-2 px-3 py-2.5 text-sm transition-colors ${
                      disabled
                        ? 'cursor-not-allowed border-ink/10 opacity-50'
                        : checked
                          ? 'cursor-pointer border-blue bg-blue/[0.04] text-navy'
                          : 'cursor-pointer border-ink/12 text-navy hover:border-blue/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reblast-target"
                      value={item.id}
                      checked={checked}
                      disabled={disabled || busy}
                      onChange={() => onTargetChange?.(item.id)}
                      className="sr-only"
                    />
                    <span className="block font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-xs font-medium text-ink/50">{item.detail}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        {showWhenPicker ? (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-navy">When to send</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { id: 'now', label: 'Send now', icon: Send },
                { id: 'later', label: 'Schedule', icon: CalendarClock },
              ].map((item) => {
                const checked = when === item.id
                const ItemIcon = item.icon
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                      checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reblast-when"
                      value={item.id}
                      checked={checked}
                      disabled={busy}
                      onChange={() => onWhenChange?.(item.id)}
                      className="sr-only"
                    />
                    <ItemIcon
                      size={15}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className={checked ? 'text-blue' : 'text-ink/50'}
                    />
                    {item.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        {showScheduleFields ? (
          <div className="rounded-xl border border-ink/10 bg-[#F8FAFC] p-3.5">
            <p className="text-sm font-semibold text-navy">Send date & time</p>
            <p className="mt-0.5 mb-3 text-[13px] text-ink/55">
              {reblast && bulk
                ? 'Uses the original message text. Pick a calendar date and 24-hour time.'
                : 'Pick a calendar date and 24-hour time for this resend.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="reblast-send-at" className="mb-1.5 block text-xs font-semibold text-navy">
                  Date
                </label>
                <div className="relative">
                  <CalendarClock
                    size={15}
                    strokeWidth={2.1}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="reblast-send-at"
                    type="date"
                    min={earliestDate()}
                    value={sendAt}
                    disabled={busy}
                    aria-invalid={errors.sendAt ? true : undefined}
                    onChange={(event) => onSendAtChange?.(event.target.value)}
                    className={`${field} pl-10 ${errors.sendAt ? 'border-[#E0232E]' : ''}`}
                  />
                </div>
                {errors.sendAt ? <p className="mt-1.5 text-xs text-[#9F1C26]">{errors.sendAt}</p> : null}
              </div>
              <div>
                <label htmlFor="reblast-send-time" className="mb-1.5 block text-xs font-semibold text-navy">
                  Time
                </label>
                <div className="relative">
                  <AlarmClock
                    size={15}
                    strokeWidth={2.1}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="reblast-send-time"
                    type="time"
                    value={sendTime}
                    disabled={busy}
                    aria-invalid={errors.sendTime ? true : undefined}
                    onChange={(event) => onSendTimeChange?.(event.target.value)}
                    className={`${field} pl-10 ${errors.sendTime ? 'border-[#E0232E]' : ''}`}
                  />
                </div>
                {errors.sendTime ? <p className="mt-1.5 text-xs text-[#9F1C26]">{errors.sendTime}</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-navy">Sender ID</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                id: 'keep',
                label: 'Keep original',
                detail: originalSender ? `From ${originalSender}` : 'Original sender unavailable',
              },
              {
                id: 'change',
                label: 'Change sender',
                detail: senderChoices.length
                  ? `${senderChoices.length} other approved ID${senderChoices.length === 1 ? '' : 's'}`
                  : 'Choose a different approved ID',
              },
            ].map((item) => {
              const checked = senderMode === item.id
              const disabled = item.id === 'keep' && !originalSender
              return (
                <label
                  key={item.id}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm transition-colors ${
                    disabled
                      ? 'cursor-not-allowed border-ink/10 opacity-50'
                      : checked
                        ? 'cursor-pointer border-blue bg-blue/[0.04] text-navy'
                        : 'cursor-pointer border-ink/12 text-navy hover:border-blue/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="message-sender-mode"
                    value={item.id}
                    checked={checked}
                    disabled={disabled || busy}
                    onChange={() => onSenderModeChange?.(item.id)}
                    className="sr-only"
                  />
                  <span className="block font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-xs font-medium text-ink/50">{item.detail}</span>
                </label>
              )
            })}
          </div>

          {senderMode === 'change' ? (
            <div className="mt-3">
              {sendersLoading ? <p className="text-sm text-ink/55">Loading sender IDs…</p> : null}
              {sendersError ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-[#9F1C26]">{sendersError}</p>
                  {onRetrySenders ? (
                    <button
                      type="button"
                      onClick={onRetrySenders}
                      className={`text-sm font-semibold text-blue ${focusClass}`}
                    >
                      Try again
                    </button>
                  ) : null}
                </div>
              ) : null}
              {!sendersLoading && !sendersError ? (
                senders.length || originalSender ? (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-navy">Send as</span>
                    <select
                      value={sender}
                      disabled={busy}
                      aria-invalid={errors.sender ? true : undefined}
                      onChange={(event) => onSenderChange?.(event.target.value)}
                      className={`${field} ${errors.sender ? 'border-[#E0232E]' : ''}`}
                    >
                      <option value="">Select a sender ID</option>
                      {originalSender ? (
                        <option value={originalSender}>{originalSender} (original)</option>
                      ) : null}
                      {senderChoices.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {errors.sender ? <p className="mt-1.5 text-xs text-[#9F1C26]">{errors.sender}</p> : null}
                  </label>
                ) : (
                  <p className="text-sm text-[#9F1C26]">No approved sender IDs available.</p>
                )
              ) : null}
            </div>
          ) : null}
          {errors.sender && senderMode === 'keep' ? (
            <p className="mt-1.5 text-xs text-[#9F1C26]">{errors.sender}</p>
          ) : null}
        </fieldset>

        {showMessage ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-navy">Message</span>
            <PlaceholderTextarea
              data-autofocus
              value={draft}
              disabled={busy}
              maxLength={maxBodyLength}
              rows={7}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              onChange={(event) => onDraftChange(event.target.value)}
              className={`min-h-[11rem] w-full resize-y rounded-xl border border-ink/15 bg-white px-3.5 py-3 text-sm leading-6 text-navy outline-none transition-colors hover:border-blue/35 focus:border-blue focus:ring-4 focus:ring-blue/15 disabled:opacity-60 ${focusClass}`}
            />
          </label>
        ) : (
          <div className="rounded-xl border border-ink/10 bg-canvas px-3.5 py-3">
            <p className="text-xs font-semibold tracking-wide text-ink/45 uppercase">Original message</p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-ink">
              {String(message?.body ?? '').trim() || '—'}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-[#D8E7FA] bg-[#F7FBFF] px-3.5 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
            {showMessage ? (
              <>
                <span className="font-semibold text-navy">{formatCount(characters)} characters</span>
                <span className="text-ink/30" aria-hidden="true">
                  ·
                </span>
              </>
            ) : null}
            <span className="font-semibold text-navy">
              {formatCount(unitsPerRecipient)} {unitsPerRecipient === 1 ? 'unit' : 'units'} / recipient
            </span>
            <span className="text-ink/30" aria-hidden="true">
              ·
            </span>
            <span className="font-semibold text-navy">
              {formatCount(totalUnits)} total {totalUnits === 1 ? 'unit' : 'units'}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-ink/50">
            1 unit = {charsPerSmsUnit} characters. Longer text uses more units.
          </p>
        </div>

      </div>

      <footer className="shrink-0 border-t border-ink/10 px-6 py-4 sm:px-7">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-11 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-60 ${focusClass}`}
          >
            Close
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`inline-flex h-11 items-center justify-center rounded-lg bg-green px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-70 ${focusClass}`}
          >
            {busy
              ? when === 'later'
                ? 'Scheduling…'
                : reblast
                  ? 'Queueing reblast…'
                  : 'Queueing resend…'
              : when === 'later'
                ? reblast
                  ? 'Schedule reblast'
                  : 'Schedule resend'
                : reblast
                  ? 'Reblast'
                  : 'Resend'}
          </button>
        </div>
      </footer>
    </dialog>
  )
}
