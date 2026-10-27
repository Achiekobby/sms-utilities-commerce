import { formatCount } from '../../dashboard/format'
import { formatSendAt, sampleMessage, segmentCount, typeLabel } from '../../campaigns/model'
import { activeRecipients, formatStoredNumber, kindLabel } from '../model'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value}</dd>
    </div>
  )
}

export function ReviewFields({ values, groups, numbers }) {
  const segments = segmentCount(values.body.trim())
  const when = values.when === 'later' ? formatSendAt(values.sendAt) : 'Sending now'
  const recipients = values.kind === 'numbers' ? numbers.length : activeRecipients(groups)

  return (
    <div>
      <h2 className="text-base font-bold text-navy">Review</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
        This is saved under Messages. Delivery is reported after the messages leave.
      </p>

      <dl className="mt-5 sm:max-w-xl">
        <Fact label="Name" value={values.name.trim()} />
        <Fact label="Send" value={kindLabel(values.kind)} />
        <Fact label="Type" value={typeLabel(values.type)} />
        <Fact label="Recipients" value={formatCount(recipients)} />
        <Fact label="Sender" value={values.sender} />
        <Fact label="Segments" value={String(segments)} />
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

      <div className="mt-5 rounded-xl bg-canvas px-4 py-4 sm:max-w-xl">
        <p className="text-xs font-semibold tracking-wide text-ink/45">SAMPLE FOR AMA MENSAH</p>
        <p className="mt-2 text-xs font-semibold tracking-wide text-navy">{values.sender}</p>
        <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-ink">{sampleMessage(values.body.trim())}</p>
      </div>
    </div>
  )
}
