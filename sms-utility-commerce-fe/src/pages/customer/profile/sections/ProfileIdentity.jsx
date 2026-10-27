import { getIdentity } from '../../../../components/workspace/identity'
import { displayPhone, signInLabel } from '../profileModel'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs leading-5 text-ink/50">{label}</dt>
      <dd className="min-w-0 text-right text-sm leading-5 font-medium text-navy">{value}</dd>
    </div>
  )
}

export function ProfileIdentity({ user, isVerified }) {
  const identity = getIdentity(user)
  const isBusiness = user?.accountType === 'business'

  return (
    <aside>
      <div className="rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)]">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-navy text-base font-semibold tracking-wide text-white"
          >
            {identity.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-navy">{identity.person}</p>
            <p className="truncate text-sm text-ink/55">{identity.kind}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-ink/10 pt-5">
          <Fact label="Workspace" value={identity.name} />
          <Fact label="Signs in with" value={signInLabel(user)} />
          <Fact label="Email" value={isVerified ? 'Confirmed' : 'Not confirmed yet'} />
          <Fact
            label="Mobile"
            value={displayPhone(user?.phone || (String(user?.identifier ?? '').includes('@') ? '' : user?.identifier))}
          />
        </dl>

        <p className="mt-5 text-xs leading-5 text-ink/55">
          {isBusiness
            ? 'The business name is the workspace and the name on sender ID requests. Your name is who signs in, and the name on wallet receipts.'
            : 'Your name is on the wallet and on messages you send yourself. Airtime, data, and bills use the mobile number on this account.'}
        </p>
      </div>
    </aside>
  )
}
