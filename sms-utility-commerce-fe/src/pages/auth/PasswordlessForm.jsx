import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useId, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { GoogleButton } from '../../components/GoogleButton'
import { setCredentials } from '../../features/auth/authSlice'
import { googleSession, passwordlessSession } from '../../features/auth/session'
import { countryCode, emailPattern, toPhoneIdentifier } from '../../features/auth/validation'
import { paths, safeCustomerReturn } from '../../routes/paths'

const errorColor = '#E0232E'

const modes = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone number' },
]

const fieldMotion = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.18 },
}

function ModeTabs({ mode, onChange }) {
  const group = useId()

  function onKeyDown(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const next = mode === 'email' ? 'phone' : 'email'
    onChange(next)
    document.getElementById(`${group}-${next}`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Sign in method"
      className="relative grid grid-cols-2 rounded-xl bg-ink/[0.06] p-1"
      onKeyDown={onKeyDown}
    >
      {modes.map((item) => {
        const active = item.id === mode

        return (
          <button
            key={item.id}
            id={`${group}-${item.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${group}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            className="relative rounded-lg py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            {active ? (
              <motion.span
                layoutId={`${group}-pill`}
                className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(16,33,61,0.12),0_4px_10px_-2px_rgba(16,33,61,0.12)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span
              className={`relative transition-colors duration-200 ${
                active ? 'text-navy' : 'text-ink/55 hover:text-ink'
              }`}
            >
              {item.label}
            </span>
          </button>
        )
      })}
      <span id={`${group}-panel`} className="sr-only" />
    </div>
  )
}

// Sign in for existing accounts: Google, or a one-time code to an email or mobile number.
export function PasswordlessForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const intent = 'login'
  const returnTo = location.state?.from
  const fieldId = useId()

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  function continueWithCode(event) {
    event.preventDefault()

    let identifier

    if (mode === 'email') {
      const value = email.trim().toLowerCase()
      if (!emailPattern.test(value)) {
        setError('Enter a valid email address.')
        return
      }
      identifier = value
    } else {
      identifier = toPhoneIdentifier(phone)
      if (!identifier) {
        setError('Enter a valid mobile number, for example 024 123 4567.')
        return
      }
    }

    dispatch(setCredentials(passwordlessSession(identifier, intent)))
    navigate(paths.verify, { replace: true, state: { from: returnTo } })
  }

  function continueWithGoogle() {
    dispatch(setCredentials(googleSession()))
    navigate(safeCustomerReturn(returnTo), { replace: true })
  }

  const inputShell = `flex h-12 items-center rounded-xl border bg-white transition-all duration-200 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15 ${
    error ? '' : 'border-ink/15'
  }`

  return (
    <div className="flex flex-col gap-6">
      <GoogleButton intent={intent} onClick={continueWithGoogle} />

      <div className="flex items-center gap-4" role="separator" aria-label="or">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-xs font-medium tracking-wide text-ink/45">OR USE A CODE</span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={continueWithCode} noValidate className="flex flex-col gap-5">
        <ModeTabs mode={mode} onChange={switchMode} />

        <div>
          <label htmlFor={fieldId} className="mb-2 block text-sm font-medium text-navy">
            {mode === 'email' ? 'Email address' : 'Mobile number'}
          </label>
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'email' ? (
              <motion.div key="email" {...fieldMotion}>
                <div className={inputShell} style={error ? { borderColor: errorColor } : undefined}>
                  <input
                    id={fieldId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setError('')
                    }}
                    className="h-full w-full rounded-xl bg-transparent px-4 text-base text-ink outline-none placeholder:text-ink/35"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div key="phone" {...fieldMotion}>
                <div className={inputShell} style={error ? { borderColor: errorColor } : undefined}>
                  <span className="flex h-full shrink-0 items-center border-r border-ink/10 pr-3 pl-4 text-base font-medium text-navy">
                    {countryCode}
                  </span>
                  <input
                    id={fieldId}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="24 123 4567"
                    value={phone}
                    maxLength={13}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    onChange={(event) => {
                      setPhone(event.target.value.replace(/[^\d\s]/g, ''))
                      setError('')
                    }}
                    className="h-full w-full rounded-r-xl bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink/35"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="mt-2 min-h-5 text-sm"
            style={{ color: errorColor }}
          >
            {error}
          </p>
        </div>

        <button
          type="submit"
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(20,115,230,0.7)] transition-all duration-200 hover:bg-[#0f64cf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99]"
        >
          Send code
          <ArrowRight
            size={16}
            strokeWidth={2.4}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </form>

      <p className="text-center text-sm text-ink/65">
        New here?{' '}
        <Link to={paths.signup} state={{ from: returnTo }} className="font-semibold text-blue">
          Create an account
        </Link>
      </p>
    </div>
  )
}
