import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthShell } from '../../components/AuthShell'
import { OtpInput } from '../../components/OtpInput'
import { markVerified } from '../../features/auth/authSlice'
import { paths, safeCustomerReturn } from '../../routes/paths'
import Images from '../../utils/Images'
import { useAuth } from '../../utils/hooks/useAuth'
import { useCountdown } from '../../utils/hooks/useCountdown'

const errorColor = '#E0232E'
const resendAfter = 30

function maskIdentifier(identifier) {
  if (!identifier) return 'your email or phone'

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
  const { user } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [round, setRound] = useState(0)
  const { remaining, restart } = useCountdown(resendAfter)

  function verify(value) {
    if (!/^\d{6}$/.test(value)) {
      setError('Enter all 6 digits.')
      return
    }

    dispatch(markVerified())
    navigate(safeCustomerReturn(location.state?.from), { replace: true })
  }

  function onSubmit(event) {
    event.preventDefault()
    verify(code)
  }

  function resend() {
    setCode('')
    setError('')
    restart()
    // Remounting the boxes clears them and focuses the first one again.
    setRound((value) => value + 1)
  }

  return (
    <AuthShell
      title="Enter your code"
      subtitle={`We sent a 6-digit code to ${maskIdentifier(user?.identifier)}. It may take a moment to arrive.`}
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
          className="flex h-12 w-full items-center justify-center rounded-xl bg-green text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,136,89,0.65)] transition-all duration-200 hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99]"
        >
          Verify and continue
        </button>

        <div className="space-y-2 text-center text-sm text-ink/65">
          <p>
            Did not get it?{' '}
            {remaining > 0 ? (
              <span className="font-medium text-ink/45">Resend in {remaining}s</span>
            ) : (
              <button
                type="button"
                onClick={resend}
                className="font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                Resend code
              </button>
            )}
          </p>
          <p>
            <Link to={paths.home} className="text-ink/55 underline underline-offset-2 hover:text-blue">
              Use a different email or number
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  )
}
