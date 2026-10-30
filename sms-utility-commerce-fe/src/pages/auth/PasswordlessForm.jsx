import { ArrowRight } from 'lucide-react'
import { useId, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { GoogleButton } from '../../components/GoogleButton'
import { beginVerification, setCredentials } from '../../features/auth/authSlice'
import { apiErrorMessage, isUnverifiedAccount, verificationFrom } from '../../features/auth/client'
import { googleSession } from '../../features/auth/session'
import { emailPattern } from '../../features/auth/validation'
import { paths, safeCustomerReturn } from '../../routes/paths'
import { useRequestOtpMutation, useResendOtpMutation } from '../../services/api/auth/authApi'

const errorColor = '#E0232E'

// Sign in for existing accounts: Google, or a one-time code sent to an email.
export function PasswordlessForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [requestOtp, { isLoading: requesting }] = useRequestOtpMutation()
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation()
  const intent = 'login'
  const returnTo = location.state?.from
  const fieldId = useId()
  const submitting = requesting || resending

  async function openVerification(type, payload, address) {
    dispatch(beginVerification(verificationFrom(payload, type, address)))
    navigate(paths.verify, { replace: true, state: { from: returnTo } })
  }

  async function continueWithCode(event) {
    event.preventDefault()
    const value = email.trim().toLowerCase()

    if (!emailPattern.test(value)) {
      setError('Enter a valid email address.')
      return
    }

    try {
      const result = await requestOtp({ email: value, type: 'login' }).unwrap()
      await openVerification('login', result.data, value)
    } catch (requestError) {
      if (!isUnverifiedAccount(requestError)) {
        setError(apiErrorMessage(requestError))
        return
      }

      try {
        const resent = await resendOtp({ email: value, type: 'registration' }).unwrap()
        await openVerification('registration', resent.data, value)
      } catch {
        await openVerification('registration', null, value)
      }
    }
  }

  function continueWithGoogle() {
    dispatch(setCredentials(googleSession()))
    navigate(safeCustomerReturn(returnTo), { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <GoogleButton intent={intent} onClick={continueWithGoogle} />

      <div className="flex items-center gap-4" role="separator" aria-label="or">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-xs font-medium tracking-wide text-ink/45">OR USE A CODE</span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={continueWithCode} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor={fieldId} className="mb-2 block text-sm font-medium text-navy">
            Email address
          </label>
          <div
            className={`flex h-12 items-center rounded-xl border bg-white transition-all duration-200 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15 ${
              error ? '' : 'border-ink/15'
            }`}
            style={error ? { borderColor: errorColor } : undefined}
          >
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
          disabled={submitting}
          aria-busy={submitting}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,136,89,0.65)] transition-all duration-200 hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Sending code' : 'Send code'}
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
