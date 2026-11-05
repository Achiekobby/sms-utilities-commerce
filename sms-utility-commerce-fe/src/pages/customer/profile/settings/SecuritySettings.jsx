import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { signOut } from '../../../../features/auth/signOut'
import { paths } from '../../../../routes/paths'
import { formatProfileDate, signInLabel } from '../profileModel'

function currentDevice() {
  const agent = navigator.userAgent
  const browser = /Edg\//.test(agent)
    ? 'Edge'
    : /Chrome\//.test(agent)
      ? 'Chrome'
      : /Firefox\//.test(agent)
        ? 'Firefox'
        : /Safari\//.test(agent)
          ? 'Safari'
          : 'This browser'
  const system = /Windows/.test(agent)
    ? 'Windows'
    : /Mac OS/.test(agent)
      ? 'macOS'
      : /Android/.test(agent)
        ? 'Android'
        : /iPhone|iPad/.test(agent)
          ? 'iOS'
          : /Linux/.test(agent)
            ? 'Linux'
            : 'this device'

  return { label: `${browser} on ${system}` }
}

const card = 'rounded-xl border border-ink/[0.08] bg-white p-5 sm:p-6'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SecuritySettings({ user }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const device = currentDevice()
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  function leave() {
    dispatch(signOut())
    navigate(paths.login, { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <section className={card}>
        <h2 className="text-base font-semibold text-navy">Sign-in</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">
          This account uses {signInLabel(user).toLowerCase()}. There is no password to store or change.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink/55">Method</dt>
            <dd className="mt-0.5 text-sm font-medium text-navy">{signInLabel(user)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/55">Last sign-in</dt>
            <dd className="mt-0.5 text-sm font-medium text-navy">
              {user?.lastLoginAt ? formatProfileDate(user.lastLoginAt) : 'Not available'}
            </dd>
          </div>
        </dl>
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-navy">Two-factor authentication</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F6FB] px-2 py-0.5 text-xs font-semibold text-ink/70">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ink/35" />
            Unavailable
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
          Sign-in already asks for a one-time code sent to your email. A separate authenticator is not offered on this account.
        </p>
      </section>

      <section className={card} aria-labelledby="sessions-heading">
        <h2 id="sessions-heading" className="text-base font-semibold text-navy">
          Active sessions
        </h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">This browser is the only session this page can see.</p>
        <article className="mt-4 rounded-lg border border-ink/[0.08] px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-navy">{device.label}</h3>
              <p className="mt-1 text-sm text-ink/60">Location and IP address are not available from this browser.</p>
              <p className="mt-1 text-sm text-ink/60">
                Last active: <span className="font-medium text-navy">Now</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF3E6] px-2 py-0.5 text-xs font-semibold text-[#0E7A38]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#0E7A38]" />
              Current device
            </span>
          </div>
        </article>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className={`inline-flex h-10 cursor-pointer items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
          >
            Sign out
          </button>
        </div>
      </section>

      {confirmSignOut ? (
        <ConfirmDialog
          title="Sign out of this device?"
          description="You will need a new sign-in code to open the workspace again."
          confirmLabel="Sign out"
          busyLabel="Signing out"
          tone="caution"
          onConfirm={leave}
          onClose={() => setConfirmSignOut(false)}
        />
      ) : null}
    </div>
  )
}
