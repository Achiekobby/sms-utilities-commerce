import { formatUnits, formatWhen, labelize, money, monthSpan } from '../../../features/subscriptions/subscriptionModel'

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/[0.06] py-2.5 last:border-b-0">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium break-words text-navy">{value}</dd>
    </div>
  )
}

export function SubscriptionFacts({ subscription }) {
  const units = formatUnits(subscription?.units)
  const length = subscription?.duration_in_months ? monthSpan(subscription.duration_in_months) : 'No fixed length'
  const ends = subscription?.ends_at ? formatWhen(subscription.ends_at) : 'No end date'
  return (
    <dl>
      <Row label="Plan" value={subscription?.plan_name} />
      <Row label="Type" value={labelize(subscription?.type || subscription?.plan_type)} />
      <Row label="Status" value={labelize(subscription?.status)} />
      <Row label="Price" value={money(subscription?.price ?? subscription?.plan_price)} />
      <Row label="Units" value={units || 'Not set'} />
      <Row label="Length" value={length} />
      <Row label="Starts" value={formatWhen(subscription?.starts_at)} />
      <Row label="Ends" value={ends} />
      <Row label="Payment" value={labelize(subscription?.payment_status)} />
      <Row label="Reference" value={subscription?.payment_reference} />
    </dl>
  )
}
