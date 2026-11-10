import { ArrowLeft, CheckCircle2, Clock3, Send, XCircle } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { KindBadge } from './sections/KindBadge'
import { paths } from '../../../routes/paths'
import { formatStamp } from '../../../features/contacts/contactImport'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { CampaignStatus } from '../campaigns/sections/CampaignStatus'
import { formatCreated, messageCount, whenLabel } from '../campaigns/model'
import {
  formatStoredNumber,
  messageDeliveryRate,
  messageHasDelivery,
} from './model'
import { useMessage } from './useMessages'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value ?? '—'}</dd>
    </div>
  )
}

function DeliveryStat({ label, value, icon: Icon, tone }) {
  return (
    <div className={`rounded-xl px-3 py-3 ${tone}`}>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-ink/55">
        <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-navy tabular-nums">
        {value == null ? '—' : formatCount(value)}
      </dd>
    </div>
  )
}

function MissingMessage() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-2xl font-semibold text-navy">Message not found</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">That report is not in this workspace.</p>
      <Link
        to={paths.messages}
        className={`mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}
      >
        <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
        Back to messages
      </Link>
    </div>
  )
}

export function MessageDetailPage() {
  const { messageId } = useParams()
  const location = useLocation()
  const seed = location.state?.message && typeof location.state.message === 'object' ? location.state.message : null
  const message = useMessage(messageId, seed)
  useDocumentTitle(message ? message.name : 'Message')

  if (!message) return <MissingMessage />

  const reported = messageHasDelivery(message)
  const created = formatStamp(message.createdAt) || formatCreated(message.createdAt)
  const completed = formatStamp(message.completedAt)
  const isBulk = message.kind === 'groups'

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-ink/55">
        <Link to={paths.messages} className={`inline-flex items-center gap-1 rounded-sm text-blue ${focusClass}`}>
          <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
          Messages
        </Link>
      </p>

      <header className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Message report</h1>
            <CampaignStatus status={message.status} />
            <KindBadge kind={message.kind} />
          </div>
          <p className="mt-1.5 text-sm text-ink/55">
            Created {created}
            {completed ? ` · Completed ${completed}` : ''}
          </p>
        </div>
      </header>

      <section className={`${card} mt-6`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-navy">Message</h2>
          <p className="text-xs font-medium text-ink/50 tabular-nums">
            {formatCount(message.segments || 1)} {message.segments === 1 ? 'part' : 'parts'}
          </p>
        </div>
        <div className="mt-4 rounded-xl border border-[#D8E7FA] bg-gradient-to-b from-[#F7FBFF] to-white px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-navy">{message.sender || '—'}</p>
          <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-7 text-ink">
            {String(message.body ?? '').trim() || '—'}
          </p>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h2 className="text-base font-bold text-navy">Send</h2>
          <dl className="mt-2">
            <Fact label="Audience" value={<KindBadge kind={message.kind} />} />
            <Fact label="Recipients" value={formatCount(message.recipients)} />
            <Fact label="Messages" value={formatCount(messageCount(message))} />
            <Fact label="Sender" value={message.sender || '—'} />
            <Fact label="When" value={whenLabel(message)} />
            <Fact label="Request type" value={message.requestType || '—'} />
            <Fact label="Mode" value={message.mode || '—'} />
          </dl>
        </section>

        <section aria-labelledby="message-audience" className={card}>
          <h2 id="message-audience" className="text-base font-bold text-navy">
            {isBulk ? 'Groups' : 'Numbers'}
          </h2>
          {isBulk ? (
            message.groups?.length ? (
              <ul className="mt-4 grid gap-2">
                {message.groups.map((group) => (
                  <li key={group.id}>
                    <Link
                      to={paths.contactGroup(group.id)}
                      className={`flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm transition-colors hover:border-blue/40 ${focusClass}`}
                    >
                      <span className="font-semibold text-blue">{group.name}</span>
                      <span className="text-xs text-ink/55 tabular-nums">{formatCount(group.active)} active</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink/55">No contact groups on this send.</p>
            )
          ) : message.numbers?.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {message.numbers.map((number) => (
                <li key={number} className="rounded-lg bg-canvas px-3 py-2 text-sm font-medium text-navy tabular-nums">
                  {formatStoredNumber(number)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink/55">No numbers on this send.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="message-delivery" className={`${card} mt-4`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="message-delivery" className="text-base font-bold text-navy">
              Delivery
            </h2>
            {reported ? (
              <p className="mt-1 text-3xl font-bold tracking-tight text-navy tabular-nums">
                {messageDeliveryRate(message)}
              </p>
            ) : null}
          </div>
        </div>
        {reported ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DeliveryStat label="Sent" value={message.sent} icon={Send} tone="bg-[#E7F1FC]" />
            <DeliveryStat label="Delivered" value={message.delivered} icon={CheckCircle2} tone="bg-[#E5F6EC]" />
            <DeliveryStat label="Pending" value={message.pending} icon={Clock3} tone="bg-[#FFF8EE]" />
            <DeliveryStat label="Failed" value={message.failed} icon={XCircle} tone="bg-[#FDECEE]" />
          </dl>
        ) : (
          <p className="mt-3 text-sm leading-6 text-ink/60">Delivery has not been reported yet.</p>
        )}
      </section>

      <section className={`${card} mt-4`}>
        <h2 className="text-base font-bold text-navy">Units</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Used', message.unitsUsed],
            ['Refunded', message.unitsRefunded],
            ['Balance before', message.unitsBefore],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-canvas px-3 py-3">
              <dt className="text-xs text-ink/50">{label}</dt>
              <dd className="mt-1 text-lg font-semibold text-navy tabular-nums">
                {value == null ? '—' : formatCount(value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
