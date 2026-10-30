import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthShell } from '../../components/AuthShell'
import { OtpInput } from '../../components/OtpInput'
import { markVerified, selectPendingVerification, setCredentials } from '../../features/auth/authSlice'
import { apiErrorMessage, sessionFromVerification } from '../../features/auth/client'
import { paths, safeCustomerReturn } from '../../routes/paths'
import { useResendOtpMutation, useVerifyOtpMutation } from '../../services/api/auth/authApi'
import Images from '../../utils/Images'
import { useAuth } from '../../utils/hooks/useAuth'
import { useCountdown } from '../../utils/hooks/useCountdown'

const errorColor = '#E0232E'
const resendAfter = 30

function maskIdentifier(identifier) {
  if (!identifier) return 'your email'

  if (identifier.includes('@')) {
    const [name, domain] = identifier.split('@')
    return `${name.slice(0, 1)}${'•'.repeat(Math.max(name.length - 1, 2))}@${domain}`
  }

  return `${identifier.slice(0, 4)} ••• ••• ${identifier.slice(-3)}`
}

export function VerifyPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const pending = useSelector(selectPendingVerification)
  const { user } = useAuth()
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation()
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [round, setRound] = useState(0)
  const busy = useRef(false)
  const { remaining, restart } = useCountdown(resendAfter)

  const email = pending?.email || user?.email || user?.identifier || ''
  const type = pending?.type || (user?.intent === 'signup' ? 'registration' : 'login')

  async function verify(value) {
    if (busy.current) return
    if (!/^\d{6}$/.test(value)) {
      setError('Enter all 6 digits.')
      return
    }
    if (!pending) {
      dispatch(markVerified())
      navigate(safeCustomerReturn(location.state?.from), { replace: true })
      return
    }

    if (!email) {
      setError('Start again from sign in so we know which email to check.')
      return
    }

    busy.current = true
    try {
      const result = await verifyOtp({ email, otp: value, type }).unwrap()
      if (!result.data?.access_token) {
        setError(result.message || 'Enter the code from your email.')
        return
      }
      dispatch(setCredentials(sessionFromVerification(result.data)))
      navigate(safeCustomerReturn(location.state?.from), { replace: true })
    } catch (verifyError) {
      setError(apiErrorMessage(verifyError))
    } finally {
      busy.current = false
    }
  }

  function onSubmit(event) {
    event.preventDefault()
    verify(code)
  }

  async function resend() {
    if (resending) return
    if (!pending) {
      setCode('')
      setError('')
      restart()
      setRound((value) => value + 1)
      return
    }
    if (!email) return
    setError('')

    try {
      await resendOtp({ email, type }).unwrap()
      setCode('')
      restart()
      setRound((value) => value + 1)
    } catch (resendError) {
      setError(apiErrorMessage(resendError))
    }
  }

  function useDifferentEmail() {
    navigate(type === 'registration' ? paths.signup : paths.login, {
      replace: true,
      state: { switchAccount: true },
    })
  }

  return (
    <AuthShell
      title="Enter your code"
      subtitle={`We sent a 6-digit code to ${maskIdentifier(email)}. It may take a moment to arrive.`}
      image={Images.auth}
      caption={{
        title: 'Almost there.',
        text: 'Confirming your code keeps your wallet and your contacts safe.',
      }}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div>
          <OtpInput
            key={round}
            label="Verification code"
            error={Boolean(error)}
            onChange={(value) => {
              setCode(value)
              setError('')
            }}
            onComplete={verify}
          />
          <p role="alert" className="mt-3 min-h-5 text-sm" style={{ color: errorColor }}>
            {error}
          </p>
        </div>

        <button
          type="submit"
          disabled={verifying}
          aria-busy={verifying}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-green text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,136,89,0.65)] transition-all duration-200 hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {verifying ? 'Checking code' : 'Verify and continue'}
        </button>

        <div className="space-y-2 text-center text-sm text-ink/65">
          <p>
            Did not get it?{' '}
            {remaining > 0 ? (
              <span className="font-medium text-ink/45">Resend in {remaining}s</span>
            ) : (
              <button
                type="button"
                disabled={resending}
                onClick={resend}
                className="font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60"
              >
                {resending ? 'Sending' : 'Resend code'}
              </button>
            )}
          </p>
          <p>
            <button
              type="button"
              onClick={useDifferentEmail}
              className="text-ink/55 underline underline-offset-2 hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              Use a different email
            </button>
          </p>
          <p>
            <Link to={paths.home} className="text-ink/55 underline underline-offset-2 hover:text-blue">
              Back to home
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  )
}
