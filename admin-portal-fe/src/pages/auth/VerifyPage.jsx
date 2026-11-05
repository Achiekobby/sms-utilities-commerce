import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { OtpCode } from '../../components/OtpCode'
import { beginVerification, logout, selectPendingVerification, setSession } from '../../features/auth/authSlice'
import { apiErrorMessage, pendingFromOtp, sessionFromVerification } from '../../features/auth/session'
import { useNotify } from '../../features/notifications/useNotify'
import { paths } from '../../routes/paths'
import { useResendOtpMutation, useVerifyOtpMutation } from '../../services/api/auth/authApi'
import { useCountdown } from '../../utils/hooks/useCountdown'

const errorColor = '#E0232E'
const resendAfter = 30

export function VerifyPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const pending = useSelector(selectPendingVerification)
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation()
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation()
  const notify = useNotify()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [round, setRound] = useState(0)
  const busy = useRef(false)
  const { remaining, restart } = useCountdown(resendAfter)
  const email = pending?.email || ''

  async function verify(value) {
    if (busy.current || verifying) return
    if (!/^\d{6}$/.test(value)) {
      setError('Enter all 6 digits.')
      return
    }
    if (!email) {
      setError('Start again from sign in so we know which email to check.')
      return
    }

    busy.current = true
    setError('')
    try {
      const result = await verifyOtp({ email, otp: value, type: 'login' }).unwrap()
      const session = sessionFromVerification(result.data)
      if (!session) {
        setError(result.message || 'Enter the code from your email.')
        return
      }
      dispatch(setSession(session))
      navigate(paths.app, { replace: true })
    } catch (verifyError) {
      setError(apiErrorMessage(verifyError))
    } finally {
      busy.current = false
    }
  }

  async function resend() {
    if (resending || !email) return
    setError('')
    try {
      const result = await resendOtp({ email, type: 'login' }).unwrap()
      dispatch(beginVerification(pendingFromOtp(result.data, email)))
      setCode('')
      restart()
      setRound((value) => value + 1)
      notify.success(result.message || 'OTP sent.')
    } catch (resendError) {
      setError(apiErrorMessage(resendError))
    }
  }

  function useDifferentEmail() {
    dispatch(logout())
    navigate(paths.login, { replace: true })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        verify(code)
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <div>
        <OtpCode
          key={round}
          error={Boolean(error)}
          onChange={(value) => {
            setCode(value)
            setError('')
          }}
          onComplete={verify}
        />
        <p role="alert" className="mt-3 min-h-5 text-center text-sm" style={{ color: errorColor }}>
          {error}
        </p>
      </div>

      <button
        type="submit"
        disabled={verifying}
        aria-busy={verifying}
        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-green text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,136,89,0.65)] transition-all duration-200 hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
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
              className="cursor-pointer font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60"
            >
              {resending ? 'Sending' : 'Resend code'}
            </button>
          )}
        </p>
        <p>
          <button
            type="button"
            onClick={useDifferentEmail}
            className="cursor-pointer text-ink/55 underline underline-offset-2 hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Use a different email
          </button>
        </p>
      </div>
    </form>
  )
}
