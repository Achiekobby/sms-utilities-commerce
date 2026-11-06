import { Building2, CircleCheck, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { displayName, formatPhone, formatWhen } from '../../../features/onboarding/clientOnboarding'
import { usePermissions } from '../../../features/auth/usePermissions'
import { paths } from '../../../routes/paths'
import { cardClass, focusClass } from './ui'

function Portrait({ client, name }) {
  const [failed, setFailed] = useState(false)
  const src = client.profile_image
  if (src && !failed) {
    return (
      <span className="relative block size-16 shrink-0 overflow-hidden rounded-2xl bg-navy ring-4 ring-[#E7F8F0]">
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(true)} />
      </span>
    )
  }

  const Icon = client.account_type === 'business' ? Building2 : UserRound
  return (
    <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#E7F8F0] text-green ring-4 ring-white">
      <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
      <span className="sr-only">{name}</span>
    </span>
  )
}

function Fact({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-ink/45">{label}</dt>
      <dd className="mt-1 flex items-start gap-2 text-sm font-medium text-navy">
        <Icon size={15} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ink/35" aria-hidden="true" />
        <span className="min-w-0 break-words">{value}</span>
      </dd>
    </div>
  )
}

export function OnboardingSuccess({ client, message, onAnother }) {
  const access = usePermissions()
  const name = displayName(client)
  const business = client?.account_type === 'business'
  const place = [client?.address, client?.city, client?.region].filter(Boolean).join(', ')
  const expires = formatWhen(client?.expires_at)
  const channel = client?.channel === 'email' || !client?.channel ? 'email' : client.channel

  useEffect(() => {
    document.getElementById('onboard-success-title')?.focus()
  }, [])

  return (
    <section className={`${cardClass} profile-in`} aria-labelledby="onboard-success-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Portrait client={client ?? {}} name={name} />
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-green uppercase">
            <CircleCheck size={14} strokeWidth={2.2} aria-hidden="true" />
            Invitation sent
          </p>
          <h2 id="onboard-success-title" tabIndex={-1} className="mt-1 text-2xl font-bold tracking-tight text-navy focus:outline-none">
            {name}
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink/65">{message}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-ink/[0.06] pt-5 sm:grid-cols-2">
        <Fact icon={Mail} label="Email" value={client?.email} />
        <Fact icon={Phone} label="Mobile" value={formatPhone(client?.phone_number)} />
        <Fact icon={business ? Building2 : UserRound} label="Account" value={business ? 'Business' : 'Individual'} />
        <Fact icon={MapPin} label="Location" value={place} />
      </dl>

      <p className="mt-5 rounded-xl bg-[#E7F8F0] px-4 py-3 text-sm leading-6 text-navy">
        A code was sent by {channel}
        {expires ? ` and expires ${expires}` : ''}. The client stays unverified until they enter it.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onAnother}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
        >
          Onboard another client
        </button>
        {access.hasPermission('client.manage') && client?.id ? (
          <Link
            to={`${paths.clients}/${client.id}`}
            className={`inline-flex h-11 items-center justify-center rounded-xl border border-ink/10 px-4 text-sm font-semibold text-navy hover:border-green/40 ${focusClass}`}
          >
            View client
          </Link>
        ) : (
          <p className="text-sm text-ink/50">The same account type stays selected.</p>
        )}
      </div>
    </section>
  )
}
