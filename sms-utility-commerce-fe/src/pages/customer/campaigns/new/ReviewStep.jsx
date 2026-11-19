import {
  CalendarClock,
  Cake,
  Link2,
  Megaphone,
  MessageSquareText,
  Pencil,
  Users,
  Wallet,
} from 'lucide-react'
import { TypeBadge } from '../../../../components/TypeBadge'
import { PhonePreview } from '../sections/PhonePreview'
import { formatCount } from '../../dashboard/format'
import { formatUnits } from '../../wallet/money'
import { formatCtaValue, messageWithCta } from '../cta'
import {
  formatCreated,
  formatSendAt,
  formatSendTime,
  occasionTypeLabel,
  sampleMessage,
  segmentCount,
  triggerOffsetLabel,
  typeLabel,
} from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function previewMessage(body, cta) {
  return messageWithCta(sampleMessage(body, []), cta)
}

function scheduleSummary(values) {
  if (values.type === 'occasion') {
    const offset =
      values.triggerOffset === 'custom'
        ? `${values.customOffsetDays || '—'} days before`
        : triggerOffsetLabel(values.triggerOffset)
    const occasion =
      values.occasionType === 'custom' && values.customDate
        ? `Custom date (${formatCreated(`${values.customDate}T12:00:00`)})`
        : occasionTypeLabel(values.occasionType)
    return `${occasion} · ${offset} at ${formatSendTime(values.sendTime)}${
      values.repeatYearly ? ' · Every year' : ''
    }`
  }
  if (values.when !== 'later') return 'Send now'
  if (!values.sendAt) return 'Scheduled'
  return values.sendTime
    ? `${formatSendAt(String(values.sendAt).slice(0, 10))} at ${formatSendTime(values.sendTime)}`
    : formatSendAt(String(values.sendAt).slice(0, 10))
}

function ReviewCard({ icon: Icon, title, onEdit, children, tone = 'bg-[#F3F6FB] text-blue' }) {
  return (
    <section className="rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <h3 className="text-sm font-bold text-navy">{title}</h3>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-blue hover:bg-blue/[0.06] ${focusClass}`}
          >
            <Pencil size={13} strokeWidth={2.2} aria-hidden="true" />
            Edit
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-navy">{value}</dd>
    </div>
  )
}

export function ReviewStep({ values, groups, cost, onEdit, editing = false }) {
  const segments = segmentCount(values.body.trim())
  const recipients = groups.reduce((sum, group) => sum + group.breakdown.active, 0)
  const estimated = recipients * Math.max(segments, 1)
  const TypeIcon = values.type === 'occasion' ? Cake : Megaphone

  return (
    <div>
      <h2 className="text-base font-bold text-navy sm:text-lg">Review</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
        {editing
          ? 'Review the changes, then save. The message stays as it is until the campaign is activated.'
          : 'Saving stores this as a draft. The message stays here until the campaign is activated.'}
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,22.5rem)] xl:items-start">
        <div className="space-y-3">
          <ReviewCard
            icon={TypeIcon}
            title="Campaign"
            tone={values.type === 'occasion' ? 'bg-[#FFE8D6] text-[#C2410C]' : 'bg-[#E7F1FC] text-blue'}
            onEdit={onEdit ? () => onEdit(2) : undefined}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-bold text-navy">{values.name.trim() || 'Untitled campaign'}</p>
              <TypeBadge type={values.type} />
            </div>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Meta label="Sender" value={values.sender || '—'} />
              <Meta label="Type" value={typeLabel(values.type)} />
            </dl>
          </ReviewCard>

          <ReviewCard icon={Users} title="Audience" onEdit={onEdit ? () => onEdit(1) : undefined}>
            {groups.length ? (
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li
                    key={group.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-canvas/50 px-3 py-2.5"
                  >
                    <span className="text-sm font-semibold text-navy">{group.name}</span>
                    <span className="text-xs font-medium text-ink/55 tabular-nums">
                      {formatCount(group.breakdown.active)} active
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/55">No groups selected.</p>
            )}
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Meta label="SMS recipients" value={formatCount(recipients)} />
            </dl>
          </ReviewCard>

          <ReviewCard
            icon={MessageSquareText}
            title="Message"
            onEdit={onEdit ? () => onEdit(2) : undefined}
          >
            <p className="rounded-xl bg-canvas px-3.5 py-3 text-sm leading-6 whitespace-pre-wrap text-ink">
              {previewMessage(values.body, values.type === 'promotion' ? values.cta : null).trim() || '—'}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <Meta label="Characters" value={formatCount(values.body.trim().length)} />
              <Meta
                label="Segments"
                value={`${formatCount(segments)} ${segments === 1 ? 'segment' : 'segments'}`}
              />
            </dl>
          </ReviewCard>

          {values.type === 'promotion' && values.cta?.placement && values.cta.placement !== 'none' ? (
            <ReviewCard
              icon={Link2}
              title="CTA"
              tone="bg-[#EEF2F7] text-navy"
              onEdit={onEdit ? () => onEdit(2) : undefined}
            >
              {values.cta.placement === 'message' ? (
                <p className="text-sm leading-6 text-ink/70">The link is written in the message. It is not sent as a separate call to action.</p>
              ) : (
                <>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <Meta label="CTA" value={formatCtaValue({ ...values.cta, enabled: true, type: 'link' })} />
                    <Meta label="Label" value={values.cta.label?.trim() || '—'} />
                  </dl>
                  <p className="mt-3 text-[13px] leading-5 text-ink/55">
                    {values.cta.label?.trim()
                      ? `Added at the end as “${values.cta.label.trim()}: …”`
                      : 'Added at the end of the message.'}
                  </p>
                </>
              )}
            </ReviewCard>
          ) : null}

          <ReviewCard
            icon={CalendarClock}
            title={values.type === 'occasion' ? 'Trigger' : 'Schedule'}
            onEdit={onEdit ? () => onEdit(3) : undefined}
          >
            <p className="text-sm font-semibold leading-6 text-navy">{scheduleSummary(values)}</p>
          </ReviewCard>
        </div>

        <div className="self-start xl:sticky xl:top-4">
          <div className="rounded-2xl border border-[#D8E7FA] bg-[linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_45%)] px-5 py-5 sm:px-6">
            <p className="text-center text-xs font-semibold tracking-wide text-ink/45 uppercase">Phone preview</p>
            <div className="mt-4 flex justify-center">
              <PhonePreview
                sender={values.sender}
                body={values.body}
                cta={values.type === 'promotion' ? values.cta : null}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ReviewCard icon={Wallet} title="Estimated usage">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-canvas px-4 py-3">
              <Meta label="SMS cost" value={formatUnits(cost)} />
            </div>
            <div className="rounded-xl bg-canvas px-4 py-3">
              <Meta label="SMS volume" value={formatCount(estimated)} />
            </div>
            <div className="rounded-xl bg-canvas px-4 py-3">
              <Meta label="Segments" value={formatCount(segments)} />
            </div>
          </dl>
          <p className="mt-3 text-[13px] leading-5 text-ink/55">
            These figures are estimates. Saving the draft does not charge the wallet.
          </p>
        </ReviewCard>
      </div>
    </div>
  )
}
