import {
  AlarmClock,
  Cake,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Check,
  Gift,
  RefreshCw,
  Send,
  UserRoundCheck,
} from 'lucide-react'
import {
  formatCreated,
  formatSendAt,
  formatSendTime,
  occasionTypeLabel,
  occasionTypes,
  triggerOffsetLabel,
  triggerOffsets,
} from '../model'

function formatCustomDate(value) {
  if (!value) return 'Not chosen yet'
  return formatCreated(`${value}T12:00:00`)
}

const field =
  'h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-navy outline-none transition-colors placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const errorColor = '#E0232E'

const occasionIcons = {
  birthday: Cake,
  anniversary: Gift,
  appointment: CalendarDays,
  membership: UserRoundCheck,
  custom: CalendarPlus,
}

function FieldError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-2 text-sm" style={{ color: errorColor }}>
      {children}
    </p>
  )
}

function GroupLabel({ children, hint }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-navy">{children}</p>
      {hint ? <p className="mt-0.5 text-[13px] leading-5 text-ink/55">{hint}</p> : null}
    </div>
  )
}

function PreviewPanel({ eyebrow, headline, points }) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.05),0_16px_32px_-24px_rgba(11,31,91,0.4)] lg:sticky lg:top-4">
      <div className="border-b border-[#D8E7FA] bg-[linear-gradient(135deg,#F7FBFF_0%,#EEF5FF_100%)] px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-blue uppercase">{eyebrow}</p>
        <p className="mt-2 text-[15px] font-bold leading-6 text-navy">{headline}</p>
      </div>
      <ul className="space-y-0 px-2 py-2">
        {points.map((point) => {
          const Icon = point.icon
          return (
            <li key={point.label} className="flex items-start gap-3 rounded-xl px-3 py-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F6FB] text-blue">
                <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-ink/50">{point.label}</span>
                <span className="mt-0.5 block text-sm font-semibold text-navy">{point.value}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function occasionHeadline(values) {
  if (!values.occasionType) return 'Choose an occasion to preview the trigger.'
  const time = values.sendTime ? formatSendTime(values.sendTime) : 'your chosen time'
  if (values.occasionType === 'custom') {
    if (!values.customDate) return 'Choose a custom date to preview the trigger.'
    const date = formatCustomDate(values.customDate)
    if (values.triggerOffset === 'custom') {
      const days = values.customOffsetDays || '—'
      return `Sends ${days} day${days === '1' ? '' : 's'} before ${date} at ${time}.`
    }
    if (values.triggerOffset === 'on') return `Sends on ${date} at ${time}.`
    return `Sends ${triggerOffsetLabel(values.triggerOffset).toLowerCase()} ${date} at ${time}.`
  }
  const occasion = occasionTypeLabel(values.occasionType).toLowerCase()
  if (values.triggerOffset === 'custom') {
    const days = values.customOffsetDays || '—'
    return `Sends ${days} day${days === '1' ? '' : 's'} before each ${occasion} at ${time}.`
  }
  if (values.triggerOffset === 'on') return `Sends on each contact’s ${occasion} at ${time}.`
  const offset = triggerOffsetLabel(values.triggerOffset).toLowerCase()
  return `Sends ${offset} each ${occasion} at ${time}.`
}

function OccasionSchedule({ values, errors, onChange }) {
  const OccasionIcon = occasionIcons[values.occasionType] ?? CalendarDays

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.95fr)] lg:items-start">
      <div className="space-y-8">
        <div>
          <GroupLabel hint="This decides which contact date the campaign follows.">Occasion</GroupLabel>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Occasion type">
            {occasionTypes.map((item) => {
              const Icon = occasionIcons[item.id] ?? CalendarPlus
              const selected = values.occasionType === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange('occasionType', item.id)}
                  className={`flex h-11 w-full items-center justify-start gap-2 rounded-xl border px-3.5 text-left text-sm font-semibold transition-colors ${focusClass} ${
                    selected
                      ? 'border-blue bg-blue text-white shadow-[0_1px_2px_rgba(11,99,246,0.35)]'
                      : 'border-ink/12 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
                  }`}
                >
                  <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
          <FieldError>{errors.occasionType}</FieldError>

          <div
            className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              values.occasionType === 'custom' ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="max-w-sm rounded-2xl border border-ink/10 bg-[#F8FAFC] p-4">
                <label htmlFor="custom-date" className="mb-1.5 block text-sm font-semibold text-navy">
                  Custom date
                </label>
                <p className="mb-3 text-[13px] text-ink/55">Choose the date this campaign should follow.</p>
                <div className="relative">
                  <CalendarDays
                    size={15}
                    strokeWidth={2.1}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="custom-date"
                    type="date"
                    value={values.customDate}
                    onChange={(event) => onChange('customDate', event.target.value)}
                    aria-invalid={errors.customDate ? true : undefined}
                    className={`${field} bg-white pl-10`}
                  />
                </div>
                <FieldError>{errors.customDate}</FieldError>
              </div>
            </div>
          </div>
        </div>

        <div>
          <GroupLabel hint="Relative to each contact’s occasion date.">Send timing</GroupLabel>
          <div className="rounded-2xl bg-[#F3F6FB] p-1.5" role="radiogroup" aria-label="Trigger offset">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
              {triggerOffsets.map((item) => {
                const selected = values.triggerOffset === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange('triggerOffset', item.id)}
                    className={`rounded-xl px-2.5 py-3 text-center transition-colors ${focusClass} ${
                      selected
                        ? 'bg-white text-navy shadow-[0_1px_2px_rgba(16,33,61,0.08)]'
                        : 'text-ink/60 hover:bg-white/70 hover:text-navy'
                    }`}
                  >
                    <span className="block text-[13px] font-semibold leading-4">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <FieldError>{errors.triggerOffset}</FieldError>

          {values.triggerOffset === 'custom' ? (
            <div className="mt-3 max-w-[12rem]">
              <label htmlFor="custom-offset" className="mb-1.5 block text-xs font-semibold text-navy">
                Days before
              </label>
              <input
                id="custom-offset"
                type="number"
                min="1"
                max="60"
                value={values.customOffsetDays}
                onChange={(event) => onChange('customOffsetDays', event.target.value)}
                className={field}
              />
              <FieldError>{errors.customOffsetDays}</FieldError>
            </div>
          ) : null}
        </div>

        <div>
          <GroupLabel hint="Applies to every automated send from this campaign.">Delivery</GroupLabel>
          <div className="grid gap-4">
            <div className="max-w-xs">
              <label htmlFor="send-time" className="mb-1.5 block text-xs font-semibold text-navy">
                Time of day
              </label>
              <div className="relative">
                <AlarmClock
                  size={15}
                  strokeWidth={2.1}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/40"
                />
                <input
                  id="send-time"
                  type="time"
                  value={values.sendTime}
                  onChange={(event) => onChange('sendTime', event.target.value)}
                  className={`${field} pl-10`}
                />
              </div>
              <FieldError>{errors.sendTime}</FieldError>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={values.repeatYearly}
              onClick={() => onChange('repeatYearly', !values.repeatYearly)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${focusClass} ${
                values.repeatYearly
                  ? 'border-blue/30 bg-blue/[0.05]'
                  : 'border-ink/10 bg-white hover:border-blue/30'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    values.repeatYearly ? 'bg-blue text-white' : 'bg-[#F3F6FB] text-blue'
                  }`}
                >
                  <RefreshCw size={15} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy">Repeat every year</span>
                  <span className="mt-0.5 block text-xs text-ink/55">Ideal for birthdays and anniversaries</span>
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  values.repeatYearly ? 'bg-blue' : 'bg-ink/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                    values.repeatYearly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <PreviewPanel
        eyebrow="Automation preview"
        headline={occasionHeadline(values)}
        points={[
          {
            icon: OccasionIcon,
            label: 'Occasion',
            value: values.occasionType ? occasionTypeLabel(values.occasionType) : 'Not chosen yet',
          },
          ...(values.occasionType === 'custom'
            ? [
                {
                  icon: CalendarDays,
                  label: 'Custom date',
                  value: formatCustomDate(values.customDate),
                },
              ]
            : []),
          {
            icon: CalendarClock,
            label: 'Trigger',
            value:
              values.triggerOffset === 'custom'
                ? `${values.customOffsetDays || '—'} days before`
                : values.triggerOffset
                  ? triggerOffsetLabel(values.triggerOffset)
                  : 'Not chosen yet',
          },
          {
            icon: AlarmClock,
            label: 'Send time',
            value: values.sendTime ? formatSendTime(values.sendTime) : 'Not chosen yet',
          },
          {
            icon: RefreshCw,
            label: 'Repeat',
            value: values.repeatYearly ? 'Every year' : 'One-time only',
          },
        ]}
      />
    </div>
  )
}

function PromotionSchedule({ values, errors, onChange }) {
  const later = values.when === 'later'

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.95fr)] lg:items-start">
      <div>
        <GroupLabel hint="Choose whether this promotion goes out immediately or later.">Send timing</GroupLabel>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Send timing">
          {[
            {
              id: 'now',
              title: 'Send now',
              detail: 'Starts after you confirm on the next step.',
              icon: Send,
            },
            {
              id: 'later',
              title: 'Schedule for later',
              detail: 'Pick a future date and time.',
              icon: CalendarClock,
            },
          ].map((item) => {
            const Icon = item.icon
            const selected = values.when === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange('when', item.id)}
                className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-colors ${focusClass} ${
                  selected
                    ? 'border-blue bg-[linear-gradient(180deg,#F5F9FF_0%,#FFFFFF_70%)] shadow-[0_1px_2px_rgba(20,115,230,0.08),0_14px_28px_-20px_rgba(20,115,230,0.45)]'
                    : 'border-ink/10 bg-white hover:border-blue/35'
                }`}
              >
                {selected ? (
                  <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-blue text-white">
                    <Check size={13} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                ) : null}
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${
                    selected ? 'bg-blue text-white' : 'bg-[#F3F6FB] text-blue'
                  }`}
                >
                  <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <span className="mt-4 block text-[15px] font-bold text-navy">{item.title}</span>
                <span className="mt-1 block text-sm leading-6 text-ink/60">{item.detail}</span>
              </button>
            )
          })}
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            later ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-2xl border border-ink/10 bg-[#F8FAFC] p-4 sm:p-5">
              <label htmlFor="send-at" className="mb-1.5 block text-sm font-semibold text-navy">
                Date and time
              </label>
              <p className="mb-3 text-[13px] text-ink/55">Uses your local timezone.</p>
              <div className="relative max-w-md">
                <CalendarClock
                  size={15}
                  strokeWidth={2.1}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/40"
                />
                <input
                  id="send-at"
                  type="datetime-local"
                  value={values.sendAt}
                  onChange={(event) => onChange('sendAt', event.target.value)}
                  aria-invalid={errors.sendAt ? true : undefined}
                  className={`${field} bg-white pl-10`}
                />
              </div>
              <FieldError>{errors.sendAt}</FieldError>
            </div>
          </div>
        </div>
      </div>

      <PreviewPanel
        eyebrow="Send preview"
        headline={
          later
            ? values.sendAt
              ? `This promotion will send on ${formatSendAt(values.sendAt)}.`
              : 'Pick a date and time to finish scheduling.'
            : 'This promotion will start sending right after you confirm.'
        }
        points={[
          {
            icon: later ? CalendarClock : Send,
            label: 'Mode',
            value: later ? 'Scheduled' : 'Send now',
          },
          {
            icon: AlarmClock,
            label: 'When',
            value: later ? (values.sendAt ? formatSendAt(values.sendAt) : 'Awaiting date') : 'Immediately after review',
          },
        ]}
      />
    </div>
  )
}

export function ScheduleStep({ values, errors, onChange }) {
  const isOccasion = values.type === 'occasion'

  return (
    <div>
      <h2 className="text-base font-bold text-navy sm:text-lg">When should it send?</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
        {isOccasion
          ? 'Set the trigger once. It runs automatically for every matching contact.'
          : 'Send this promotion now, or schedule it for a later date and time.'}
      </p>

      {isOccasion ? (
        <OccasionSchedule values={values} errors={errors} onChange={onChange} />
      ) : (
        <PromotionSchedule values={values} errors={errors} onChange={onChange} />
      )}
    </div>
  )
}
