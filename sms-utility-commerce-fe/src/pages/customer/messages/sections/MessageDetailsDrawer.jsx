import { ArrowUpRight, X } from 'lucide-react'
import { Link } from 'react-router'
import { Drawer } from '../../../../components/Drawer'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { paths } from '../../../../routes/paths'
import { formatCount } from '../../dashboard/format'
import { CampaignStatus } from '../../campaigns/sections/CampaignStatus'
import { messageCount } from '../../campaigns/model'
import { useGetSmsQuery } from '../../../../services/api/messages/messagesApi'
import { formatStoredNumber } from '../model'
import { messageTypeLabel } from '../query'
import { KindBadge } from './KindBadge'
import { MessageActions } from './MessageActions'
import { MessageDeliveryReport } from './MessageDeliveryReport'
import { MessageRecipients } from './MessageRecipients'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Fact({ label, children }) {
  return (
    <div className="border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy">{children ?? '—'}</dd>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="border-b border-ink/10 px-5 py-4 last:border-b-0">
      <h3 className="text-[13px] font-bold tracking-wide text-navy uppercase">{title}</h3>
      <div className="mt-1">{children}</div>
    </section>
  )
}

function unitsValue(value) {
  if (value == null || value === '') return '—'
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return formatCount(number)
}

function unitsAfter(message) {
  if (message.unitsBefore == null || !Number.isFinite(Number(message.unitsBefore))) return null
  const used = Number(message.unitsUsed) || 0
  const refunded = Number(message.unitsRefunded) || 0
  return Number(message.unitsBefore) - used + refunded
}

export function MessageDetailsDrawer({ message: seed, onClose, actions }) {
  const detail = useGetSmsQuery(seed?.id, { skip: seed?.id == null })
  const message = detail.data ?? seed
  const isBulk = message.kind === 'groups'
  const created = formatStamp(message.createdAt) || '—'
  const completed = formatStamp(message.completedAt)
  const showActions = Boolean(actions)

  return (
    <Drawer label="Message details" onClose={onClose} widthClass="w-[min(32rem,calc(100vw-1.5rem))]">
      <div className="flex h-full min-h-0 flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-navy">Message details</h2>
              <CampaignStatus status={message.status} />
            </div>
            <p className="mt-1 text-[13px] text-ink/60">
              {messageTypeLabel(message.kind)} · {created}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Section title="Message">
            <div className="mt-3 rounded-xl border border-[#D8E7FA] bg-gradient-to-b from-[#F7FBFF] to-white p-4">
              <p className="text-xs font-semibold tracking-wide text-navy">{message.sender || '—'}</p>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-ink">
                {String(message.body ?? '').trim() || '—'}
              </p>
            </div>
            <dl className="mt-1">
              <Fact label="Sender">{message.sender || '—'}</Fact>
              <Fact label="Parts">{formatCount(message.segments || 1)}</Fact>
              <Fact label="Record ID">{message.id || '—'}</Fact>
            </dl>
          </Section>

          <Section title="Send">
            <dl>
              <Fact label="Type">
                <KindBadge kind={message.kind} />
              </Fact>
              <Fact label="Request type">{message.requestType || '—'}</Fact>
              <Fact label="Mode">{message.mode || '—'}</Fact>
              <Fact label="Recipients">{formatCount(message.recipients)}</Fact>
              <Fact label="Messages">{formatCount(messageCount(message))}</Fact>
              <Fact label="Created">{created}</Fact>
              <Fact label="Completed">{completed || '—'}</Fact>
            </dl>
          </Section>

          <Section title={isBulk ? 'Groups' : 'Numbers'}>
            {isBulk ? (
              message.groups?.length ? (
                <ul className="mt-3 space-y-2">
                  {message.groups.map((group) => (
                    <li key={group.id}>
                      <Link
                        to={paths.contactGroup(group.id)}
                        onClick={onClose}
                        className={`flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm transition-colors hover:border-blue/40 ${focusClass}`}
                      >
                        <span className="font-semibold text-blue">{group.name || `Group ${group.id}`}</span>
                        <span className="text-xs text-ink/55 tabular-nums">{formatCount(group.active)} contacts</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink/55">No contact groups on this send.</p>
              )
            ) : message.numbers?.length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {message.numbers.map((number) => (
                  <li key={number} className="rounded-lg bg-canvas px-3 py-2 text-sm font-medium text-navy tabular-nums">
                    {formatStoredNumber(number)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink/55">No numbers on this send.</p>
            )}
          </Section>

          <Section title="Delivery">
            <div className="mt-3">
              <MessageDeliveryReport message={message} compact />
            </div>
          </Section>

          <Section title="Units">
            <dl className="mt-3 grid grid-cols-2 gap-2">
              {[
                ['Used', message.unitsUsed],
                ['Refunded', message.unitsRefunded],
                ['Balance before', message.unitsBefore],
                ['Balance after', unitsAfter(message)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#E7EEF8] bg-canvas px-3 py-3">
                  <dt className="text-[11px] font-semibold tracking-wide text-ink/50 uppercase">{label}</dt>
                  <dd className="mt-1 text-lg font-bold text-navy tabular-nums">{unitsValue(value)}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title="Recipients">
            <div className="mt-3">
              <MessageRecipients smsId={message.id} />
            </div>
            <Link
              to={paths.message(message.id)}
              state={{ message }}
              onClick={onClose}
              className={`mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue ${focusClass}`}
            >
              Open full report
              <ArrowUpRight size={14} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </Section>
        </div>

        {showActions ? (
          <footer className="border-t border-ink/10 px-5 py-4">
            <MessageActions message={message} actions={actions} />
          </footer>
        ) : null}
      </div>
    </Drawer>
  )
}
