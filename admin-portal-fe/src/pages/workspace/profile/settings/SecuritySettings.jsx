import { useState } from 'react'
import { useSignOut } from '../../../../features/auth/useSignOut'
import { formatStamp } from '../profileForm'
import { currentDevice } from './browserPermissions'
import { ConfirmDialog } from './ConfirmDialog'
import { cardClass, focusClass } from './ui'

export function SecuritySettings({ profile }) {
  const { signOutAdmin, signingOut } = useSignOut()
  const device = currentDevice()
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <section className={cardClass}>
        <h2 className="text-base font-semibold text-navy">Sign-in</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">
          This account uses a one-time email code. There is no password to store or change.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink/55">Method</dt>
            <dd className="mt-0.5 text-sm font-medium text-navy">Email code</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/55">Last sign-in</dt>
            <dd className="mt-0.5 text-sm font-medium text-navy">{formatStamp(profile?.last_login_at)}</dd>
          </div>
        </dl>
      </section>

      <section className={cardClass}>
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

      <section className={cardClass} aria-labelledby="sessions-heading">
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
            disabled={signingOut}
            onClick={() => setConfirmSignOut(true)}
            className={`inline-flex h-10 cursor-pointer items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
          >
            {signingOut ? 'Signing out' : 'Sign out'}
          </button>
        </div>
      </section>

      {confirmSignOut ? (
        <ConfirmDialog
          title="Sign out of this device?"
          description="You will need a new sign-in code to open the admin portal again."
          confirmLabel="Sign out"
          onConfirm={() => {
            setConfirmSignOut(false)
            signOutAdmin()
          }}
          onClose={() => setConfirmSignOut(false)}
        />
      ) : null}
    </div>
  )
}
