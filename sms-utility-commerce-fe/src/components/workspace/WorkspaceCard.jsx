import { useAuth } from '../../utils/hooks/useAuth'
import { getIdentity } from './identity'

// The account the user is working in, shown directly under the logo.
export function WorkspaceCard({ collapsed }) {
  const { user } = useAuth()
  const identity = getIdentity(user)

  return (
    <div>
      <p
        className={`mb-2 px-1 text-[11px] leading-4 font-semibold tracking-[0.14em] text-ink/45 uppercase ${
          collapsed ? 'lg:hidden' : ''
        }`}
      >
        Workspace
      </p>
      <div
        title={collapsed ? `${identity.name} · ${identity.kind}` : undefined}
        className={`flex items-center gap-3 rounded-xl bg-canvas p-2.5 ring-1 ring-ink/[0.06] ${
          collapsed ? 'lg:justify-center lg:bg-transparent lg:p-0 lg:ring-0' : ''
        }`}
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy text-sm font-semibold tracking-wide text-white"
        >
          {identity.initials}
        </span>
        <span className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
          <span className="block truncate text-sm leading-5 font-semibold text-navy">
            {identity.name}
          </span>
          <span className="block truncate text-xs leading-4 text-ink/55">{identity.kind}</span>
        </span>
      </div>
    </div>
  )
}
