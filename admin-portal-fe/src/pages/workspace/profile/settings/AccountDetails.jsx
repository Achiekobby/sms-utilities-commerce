import { formatStamp, statusLabel } from '../profileForm'
import { DangerZone } from './DangerZone'
import { cardClass } from './ui'

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-ink/[0.06] py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-sm font-medium text-navy sm:text-right">{value || 'Not available'}</dd>
    </div>
  )
}

export function AccountDetails({ profile }) {
  return (
    <div className="flex flex-col gap-4">
      <section className={cardClass}>
        <h2 className="text-base font-semibold text-navy">Account</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">Details that identify this admin. These are not edited here.</p>
        <dl className="mt-2">
          <Row label="Account ID" value={profile?.id ? String(profile.id) : ''} />
          <Row label="Role" value={profile?.role?.name} />
          <Row label="Role description" value={profile?.role?.description} />
          <Row label="Status" value={statusLabel(profile?.status)} />
          <Row label="Last sign-in" value={profile?.last_login_at ? formatStamp(profile.last_login_at) : ''} />
        </dl>
      </section>
      <DangerZone />
    </div>
  )
}
