import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'
import { formatMoney, formatProfileDate } from '../profileModel'

function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)]">
      <h2 className="text-sm font-bold text-navy">{title}</h2>
      <dl className="mt-3 space-y-2.5">{children}</dl>
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs leading-5 text-ink/50">{label}</dt>
      <dd className="min-w-0 text-right text-sm leading-5 font-medium text-navy capitalize">{value}</dd>
    </div>
  )
}

export function ProfileAccount({ user }) {
  const wallet = user?.wallet
  const plan = user?.subscription

  return (
    <div className="mt-4 flex flex-col gap-4">
      <Card title="Wallet">
        <Row label="Balance" value={wallet ? formatMoney(wallet.balance, wallet.currency || 'GHS') : '—'} />
        <Row label="Status" value={wallet?.status || '—'} />
        <div className="pt-1">
          <Link to={paths.wallet} className="text-sm font-semibold text-blue hover:underline">
            Open wallet
          </Link>
        </div>
      </Card>

      <Card title="Plan">
        <Row label="Plan" value={plan?.plan_name || '—'} />
        <Row label="Status" value={plan?.status || '—'} />
        <Row label="Price" value={plan ? formatMoney(plan.price, wallet?.currency || 'GHS') : '—'} />
        <Row label="Units" value={plan?.units ?? '—'} />
        <Row
          label="Ends"
          value={
            plan?.ends_at
              ? formatProfileDate(plan.ends_at)
              : plan?.type === 'non_expiry' || plan?.type === 'non-expiry'
                ? 'No expiry'
                : '—'
          }
        />
      </Card>
    </div>
  )
}
