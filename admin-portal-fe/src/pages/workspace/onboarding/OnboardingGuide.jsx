import { Building2, Check, ImagePlus, Mail, ShieldCheck, User } from 'lucide-react'
import { sectionStatus } from '../../../features/onboarding/clientOnboarding'
import { cardClass } from './ui'

const facts = [
  { icon: ShieldCheck, text: 'The account is created as active.' },
  { icon: Mail, text: 'A one-time code is emailed to the address you enter.' },
  { icon: User, text: 'They stay unverified until they enter that code.' },
  { icon: ImagePlus, text: 'A profile photo or logo is optional.' },
]

function checksFor(accountType) {
  return [
    { id: 'contact', label: 'Email and mobile number' },
    { id: 'identity', label: accountType === 'business' ? 'Business name' : 'Name, gender, and date of birth' },
    { id: 'location', label: 'Region, city, and address' },
  ]
}

export function OnboardingGuide({ accountType, values, className = '' }) {
  const status = accountType ? sectionStatus(accountType, values) : null
  const checks = accountType ? checksFor(accountType) : []
  const done = checks.filter((item) => status?.[item.id]).length

  return (
    <aside className={`${cardClass} ${className}`.trim()}>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">What happens next</p>
      <h2 className="mt-1 text-lg font-bold tracking-tight text-navy">They finish sign-in by email</h2>
      <ul className="mt-4 space-y-3">
        {facts.map((fact) => {
          const Icon = fact.icon
          return (
            <li key={fact.text} className="flex items-start gap-3 text-sm leading-5 text-ink/70">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#E7F8F0] text-green">
                <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
              </span>
              {fact.text}
            </li>
          )
        })}
      </ul>

      {accountType ? (
        <div className="mt-6 border-t border-ink/[0.06] pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-navy">Ready to send</h3>
            <p className="text-xs font-medium text-ink/45">
              {done} of {checks.length}
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {checks.map((item) => {
              const complete = status[item.id]
              return (
                <li key={item.id} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                      complete ? 'bg-green text-white' : 'border border-ink/15 text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className={complete ? 'text-navy' : 'text-ink/55'}>{item.label}</span>
                </li>
              )
            })}
          </ul>
          {status.photo ? (
            <p className="mt-3 text-xs text-ink/45">Photo attached.</p>
          ) : values.profileImage ? (
            <p className="mt-3 text-xs text-[#9F1C26]">That image cannot be used. Choose a JPG, PNG, or WebP under 2 MB.</p>
          ) : (
            <p className="mt-3 text-xs text-ink/45">Photo is optional and will not block onboarding.</p>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-2 border-t border-ink/[0.06] pt-5">
          <p className="flex items-center gap-2 text-sm text-ink/70">
            <User size={15} aria-hidden="true" className="text-navy" />
            Individual accounts include a legal name and date of birth.
          </p>
          <p className="flex items-center gap-2 text-sm text-ink/70">
            <Building2 size={15} aria-hidden="true" className="text-navy" />
            Business accounts use the company name instead.
          </p>
        </div>
      )}
    </aside>
  )
}
