import { Gauge, Layers, Send } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'
import { formatCount } from '../../dashboard/format'
import { formatSendAt, formatSendTime, sampleMessage, typeLabel } from '../../campaigns/model'
import { activeRecipients, formatStoredNumber, kindLabel, resolvedMessageType, smsUnitCount } from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value}</dd>
    </div>
  )
}

function UnitStat({ icon: Icon, label, value, hint, tone = 'default' }) {
  const valueClass =
    tone === 'danger' ? 'text-[#C21F2D]' : tone === 'warning' ? 'text-[#B45F06]' : tone === 'ok' ? 'text-green' : 'text-navy'

  return (
    <div className="rounded-xl border border-[#D8E7FA] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(20,115,230,0.04)]">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF2FE] text-blue">
          <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <p className="text-[11px] font-semibold tracking-wide text-ink/50 uppercase">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${valueClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs leading-5 text-ink/55">{hint}</p> : null}
    </div>
  )
}

function UnitPanel({ cost, available, recipients, unitsPerMessage, loading }) {
  const known = available != null && Number.isFinite(available)
  const remaining = known ? available - cost : null
  const short = remaining != null && remaining < 0

  return (
    <aside
      aria-label="SMS unit summary"
      className="rounded-2xl border border-[#D8E7FA] bg-gradient-to-br from-[#F7FBFF] via-white to-[#EEF6FF] p-4 shadow-[0_1px_2px_rgba(20,115,230,0.05),0_18px_40px_-28px_rgba(20,115,230,0.45)] lg:sticky lg:top-24"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-navy">Unit usage</h3>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            1 unit covers 160 characters. This send uses {formatCount(unitsPerMessage)}{' '}
            {unitsPerMessage === 1 ? 'unit' : 'units'} per recipient
            {recipients ? ` · ${formatCount(recipients)} recipients` : ''}.
          </p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
          <Layers size={16} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 grid gap-2.5">
        <UnitStat
          icon={Send}
          label="This send"
          value={loading ? '…' : formatCount(cost)}
          hint={cost === 1 ? 'SMS unit' : 'SMS units'}
        />
        <UnitStat
          icon={Gauge}
          label="Units left"
          value={loading ? '…' : known ? formatCount(available) : '—'}
          hint={known ? 'From your current plan' : 'No active subscription units'}
          tone={known && available === 0 ? 'warning' : 'default'}
        />
        <UnitStat
          icon={Layers}
          label="After this send"
          value={loading ? '…' : remaining == null ? '—' : formatCount(remaining)}
          hint={short ? 'Not enough units for this send' : remaining != null ? 'Projected balance' : 'Subscribe to track balance'}
          tone={short ? 'danger' : remaining != null ? 'ok' : 'default'}
        />
      </div>

      {short || !known ? (
        <p className="mt-3 text-xs leading-5 text-ink/60">
          {short ? 'Top up your SMS package before sending. ' : 'Need units? '}
          <Link to={paths.plans} className={`font-semibold text-blue ${focusClass}`}>
            View plans
          </Link>
        </p>
      ) : null}
    </aside>
  )
}

export function ReviewFields({
  values,
  groups,
  numbers,
  cost = 0,
  availableUnits = null,
  unitsLoading = false,
  immediate = false,
}) {
  const body = values.body.trim()
  const unitsPerMessage = smsUnitCount(body)
  const scheduled = values.when === 'later'
  const when = scheduled
    ? values.sendAt && values.sendTime
      ? `${formatSendAt(String(values.sendAt).slice(0, 10))} at ${formatSendTime(values.sendTime)}`
      : formatSendAt(values.sendAt)
    : 'Sending now'
  const recipients = values.kind === 'numbers' ? numbers.length : activeRecipients(groups)

  return (
    <div>
      <h2 className="text-base font-bold text-navy">Review</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
        {scheduled
          ? 'This is scheduled for the date and time below. A report is saved under Messages.'
          : values.kind === 'groups'
            ? 'This is queued to the selected groups. A report is saved under Messages.'
            : 'This goes out now to the numbers below. A report is saved under Messages.'}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18.5rem)] lg:items-start">
        <div className="min-w-0">
          <dl>
            {immediate ? null : <Fact label="Name" value={values.name.trim()} />}
            <Fact label="Send" value={kindLabel(values.kind)} />
            {immediate ? null : (
              <Fact
                label="Type"
                value={values.type === 'other' ? resolvedMessageType(values) || 'Other' : typeLabel(values.type)}
              />
            )}
            <Fact label="Recipients" value={formatCount(recipients)} />
            <Fact label="Sender" value={values.sender} />
            <Fact
              label="Units / recipient"
              value={`${formatCount(unitsPerMessage)} · ${formatCount(body.length)} characters`}
            />
            <Fact label="When" value={when} />
          </dl>

          {values.kind === 'numbers' ? (
            <p className="mt-4 text-sm leading-6 text-ink/70">
              {numbers.slice(0, 6).map(formatStoredNumber).join(', ')}
              {numbers.length > 6 ? ` and ${formatCount(numbers.length - 6)} more` : ''}
            </p>
          ) : (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {groups.map((group) => (
                <li key={group.id} className="rounded-xl border border-ink/10 px-3 py-2.5 text-sm">
                  <span className="font-semibold text-navy">{group.name}</span>
                  <span className="mt-0.5 block text-xs text-ink/55 tabular-nums">
                    {formatCount(group.breakdown.active)} active
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 rounded-xl bg-canvas px-4 py-4">
            <p className="text-xs font-semibold tracking-wide text-ink/45">
              {immediate ? 'MESSAGE PREVIEW' : 'SAMPLE FOR AMA MENSAH'}
            </p>
            <p className="mt-2 text-xs font-semibold tracking-wide text-navy">{values.sender}</p>
            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-ink">
              {immediate ? body : sampleMessage(body)}
            </p>
          </div>
        </div>

        <UnitPanel
          cost={cost}
          available={availableUnits}
          recipients={recipients}
          unitsPerMessage={unitsPerMessage}
          loading={unitsLoading}
        />
      </div>
    </div>
  )
}
