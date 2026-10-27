import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { KindBadge } from './sections/KindBadge'
import { TypeBadge } from '../../../components/TypeBadge'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { CampaignStatus } from '../campaigns/sections/CampaignStatus'
import { deliveryRate, formatCreated, messageCount, sampleMessage, whenLabel } from '../campaigns/model'
import { formatStoredNumber } from './model'
import { useMessage } from './useMessages'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value}</dd>
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
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
        Back to messages
      </Link>
    </div>
  )
}

export function MessageDetailPage() {
  const { messageId } = useParams()
  const message = useMessage(messageId)
  useDocumentTitle(message ? message.name : 'Message')

  if (!message) return <MissingMessage />

  const reported = message.delivered != null

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-ink/55">
        <Link
          to={paths.messages}
          className="inline-flex items-center gap-1 rounded-sm text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
          Messages
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">{message.name}</h1>
        <CampaignStatus status={message.status} />
      </div>
      <p className="mt-1.5 text-sm text-ink/55">Created {formatCreated(message.createdAt)}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6">
          <h2 className="text-base font-bold text-navy">Send</h2>
          <dl className="mt-2">
            <Fact label="Audience" value={<KindBadge kind={message.kind} />} />
            <Fact label="Type" value={<TypeBadge type={message.type} />} />
            <Fact label="Recipients" value={formatCount(message.recipients)} />
            <Fact label="Messages" value={formatCount(messageCount(message))} />
            <Fact label="Sender" value={message.sender} />
            <Fact label="When" value={whenLabel(message)} />
          </dl>
          <div className="mt-5 rounded-xl bg-canvas px-4 py-4">
            <p className="text-xs font-semibold tracking-wide text-navy">{message.sender}</p>
            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-ink">{sampleMessage(message.body)}</p>
          </div>
        </section>

        <section aria-labelledby="message-audience" className="rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6">
          <h2 id="message-audience" className="text-base font-bold text-navy">
            {message.kind === 'numbers' ? 'Numbers' : 'Groups'}
          </h2>
          {message.kind === 'numbers' ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {message.numbers.map((number) => (
                <li key={number} className="rounded-lg bg-canvas px-3 py-2 text-sm font-medium text-navy tabular-nums">
                  {formatStoredNumber(number)}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-4 grid gap-2">
              {message.groups.map((group) => (
                <li key={group.id}>
                  <Link
                    to={paths.contactGroup(group.id)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm hover:border-blue/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                  >
                    <span className="font-semibold text-blue">{group.name}</span>
                    <span className="text-xs text-ink/55 tabular-nums">{formatCount(group.active)} active</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="message-delivery" className="mt-4 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6">
        <h2 id="message-delivery" className="text-base font-bold text-navy">
          Delivery
        </h2>
        {reported ? (
          <>
            <p className="mt-1 text-2xl font-bold tracking-tight text-navy tabular-nums">{deliveryRate(message)}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ['Delivered', message.delivered],
                ['Pending', message.pending],
                ['Failed', message.failed],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-canvas px-3 py-3">
                  <dt className="text-xs text-ink/50">{label}</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy tabular-nums">{formatCount(value)}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-ink/60">Delivery has not been reported yet.</p>
        )}
      </section>
    </div>
  )
}
