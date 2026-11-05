import { getIdentity } from '../../../../components/workspace/identity'
import { ProfileAccount } from '../sections/ProfileAccount'
import { formatProfileDate, signInLabel } from '../profileModel'
import { DangerZone } from './DangerZone'

const card = 'rounded-xl border border-ink/[0.08] bg-white p-5 sm:p-6'

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-ink/[0.06] py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-sm font-medium text-navy sm:text-right">{value}</dd>
    </div>
  )
}

export function AccountDetails({ user, isVerified }) {
  const identity = getIdentity(user)

  return (
    <div className="flex flex-col gap-4">
      <section className={card}>
        <h2 className="text-base font-semibold text-navy">Account</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">Details that identify this account. These are not edited here.</p>
        <dl className="mt-2">
          <Row label="Account ID" value={user?.id ? String(user.id) : 'Not available'} />
          <Row label="Account type" value={identity.kind} />
          <Row label="Signs in with" value={signInLabel(user)} />
          <Row label="Verification" value={isVerified ? 'Email confirmed' : 'Email not confirmed yet'} />
          <Row label="Last sign-in" value={user?.lastLoginAt ? formatProfileDate(user.lastLoginAt) : 'Not available'} />
          <Row label="Verified" value={user?.verifiedAt ? formatProfileDate(user.verifiedAt) : 'Not available'} />
        </dl>
      </section>
      <ProfileAccount user={user} />
      <DangerZone />
    </div>
  )
}
