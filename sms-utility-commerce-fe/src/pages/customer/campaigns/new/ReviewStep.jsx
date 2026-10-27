import { formatCount } from '../../dashboard/format'
import { formatSendAt, sampleMessage, segmentCount, typeLabel } from '../model'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2.5">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value}</dd>
    </div>
  )
}

export function ReviewStep({ values, groups }) {
  const segments = segmentCount(values.body.trim())
  const recipients = groups.reduce((sum, group) => sum + group.breakdown.active, 0)
  const when = values.when === 'later' ? formatSendAt(values.sendAt) : 'Sending now'
  const names = groups.map((group) => group.name).join(', ')

  return (
    <div>
      <h2 className="text-base font-bold text-navy">Review</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
        This sends to active contacts in the selected groups. Delivery is reported after the messages leave.
      </p>

      <dl className="mt-5 sm:max-w-xl">
        <Fact label="Name" value={values.name.trim()} />
        <Fact label="Type" value={typeLabel(values.type)} />
        <Fact label={groups.length === 1 ? 'Group' : 'Groups'} value={names || '—'} />
        <Fact label="Recipients" value={formatCount(recipients)} />
        <Fact label="Sender" value={values.sender} />
        <Fact label="Segments" value={String(segments)} />
        <Fact label="When" value={when} />
      </dl>

      <div className="mt-5 rounded-xl bg-canvas px-4 py-4">
        <p className="text-xs font-semibold tracking-wide text-ink/45">SAMPLE FOR AMA MENSAH</p>
        <p className="mt-2 text-xs font-semibold tracking-wide text-navy">{values.sender}</p>
        <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-ink">{sampleMessage(values.body.trim())}</p>
      </div>
    </div>
  )
}
