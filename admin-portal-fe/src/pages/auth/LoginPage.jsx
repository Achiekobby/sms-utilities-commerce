import { ArrowRight } from 'lucide-react'
import { useId, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { beginVerification } from '../../features/auth/authSlice'
import { apiErrorMessage, pendingFromOtp } from '../../features/auth/session'
import { paths } from '../../routes/paths'
import { useRequestOtpMutation } from '../../services/api/auth/authApi'

const errorColor = '#E0232E'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fieldId = useId()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [requestOtp, { isLoading }] = useRequestOtpMutation()

  async function submit(event) {
    event.preventDefault()
    const value = email.trim().toLowerCase()
    if (!emailPattern.test(value)) {
      setError('Enter a valid email address.')
      return
    }

    try {
      const result = await requestOtp({ email: value, type: 'login' }).unwrap()
      dispatch(beginVerification(pendingFromOtp(result.data, value)))
      navigate(paths.verify, { replace: true })
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
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
        <p id={`${fieldId}-error`} role="alert" className="mt-2 min-h-5 text-sm" style={{ color: errorColor }}>
          {error}
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,136,89,0.65)] transition-all duration-200 hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? 'Sending code' : 'Send code'}
        <ArrowRight
          size={16}
          strokeWidth={2.4}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </form>
  )
}
