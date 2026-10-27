import { ArrowRight, LogIn } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../routes/paths'
import Images from '../utils/Images'
import { useAuth } from '../utils/hooks/useAuth'

const services = [
  { label: 'SMS Campaigns', hash: 'sms-campaigns' },
  { label: 'Wallet & Payments', hash: 'wallet' },
  { label: 'Airtime, Data & Bills', hash: 'utilities' },
  { label: 'Rewards & Surveys', hash: 'rewards' },
]

const company = [
  { label: 'Home', to: paths.home },
  { label: 'Pricing', to: paths.pricing },
  { label: 'Help', to: paths.help },
  { label: 'Terms', to: paths.terms },
]

const assurances = [
  'Reliable SMS delivery',
  'Fast utility transactions',
  'Secure payments',
  'Real-time reporting',
]

const linkClass =
  'rounded-sm text-sm text-ink/65 transition-colors hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function Footer() {
  const { isAuthenticated, isVerified } = useAuth()
  const year = new Date().getFullYear()

  // An unverified session only sees the logo in the navbar, so the footer stays quiet too.
  if (isAuthenticated && !isVerified) {
    return (
      <footer className="border-t border-ink/10 bg-white">
        <p className="mx-auto max-w-8xl px-4 py-6 text-sm text-ink/55 sm:px-6">
          © {year} UtiliSMS
        </p>
      </footer>
    )
  }

  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-8xl px-4 pt-14 pb-8 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div>
            <Link
              to={isVerified ? paths.app : paths.home}
              className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
            >
              <img src={Images.logo} alt="UtiliSMS" className="h-12 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-ink/65">
              Messaging, payments, and everyday utility services in one platform.
            </p>
          </div>

          <nav aria-label="Services">
            <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">SERVICES</p>
            <ul className="mt-4 space-y-3">
              {services.map((item) => (
                <li key={item.hash}>
                  <a href={`/#${item.hash}`} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">COMPANY</p>
            <ul className="mt-4 space-y-3">
              {company.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-ink/45">
              {isVerified ? 'WORKSPACE' : 'GET STARTED'}
            </p>
            {isVerified ? (
              <Link to={paths.app} className={`${linkClass} mt-4 inline-flex items-center gap-1.5`}>
                Open your workspace
                <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
              </Link>
            ) : (
              <>
                <p className="mt-4 text-sm leading-6 text-ink/65">
                  Create an account to fund your wallet and send your first campaign.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Link
                    to={paths.signup}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                  >
                    Sign up
                    <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
                  </Link>
                  <Link to={paths.login} className={`${linkClass} inline-flex items-center gap-1.5`}>
                    <LogIn size={15} strokeWidth={2.2} aria-hidden="true" />
                    Log in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-ink/10 pt-6">
          {assurances.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm font-medium text-navy">
              <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} UtiliSMS. All rights reserved.</p>
          <Link to={paths.terms} className="hover:text-blue">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
