import { Settings } from 'lucide-react'
import { formatStamp, statusLabel } from '../profileForm'
import { DangerZone } from './DangerZone'
import { cardClass, mintChip } from './ui'

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
        <div className="flex items-start gap-3">
          <span className={mintChip}>
            <Settings size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-navy">Account</h2>
            <p className="mt-0.5 text-sm text-ink/55">Details that identify this admin. These are not edited here.</p>
          </div>
        </div>
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
