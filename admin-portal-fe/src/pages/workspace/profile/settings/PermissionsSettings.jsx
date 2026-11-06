import { Shield } from 'lucide-react'
import { cardClass, mintChip } from './ui'

function titleCase(value) {
  return String(value)
    .split(/[._\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function moduleLabel(module) {
  return titleCase(module)
}

function permissionLabel(name, module) {
  const raw = String(name ?? '')
  const prefix = `${module}.`
  const action = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw
  return titleCase(action) || raw
}

export function PermissionsSettings({ profile }) {
  const modules = Array.isArray(profile?.role?.permissions) ? profile.role.permissions : []
  const permissionCount = modules.reduce((total, group) => total + (group.permissions?.length ?? 0), 0)
  const roleName = profile?.role?.name || 'This role'

  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={mintChip}>
            <Shield size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-navy">Role access</h2>
            <p className="mt-0.5 max-w-xl text-sm leading-6 text-ink/55">
              {roleName} decides which admin pages you can open.
              {profile?.role?.description ? ` ${profile.role.description}` : ''} It is not edited here.
            </p>
          </div>
        </div>
        <dl className="flex shrink-0 gap-2">
          <div className="rounded-xl bg-[#E7F8F0] px-3 py-2 text-center">
            <dt className="text-[11px] font-medium text-green/80">Modules</dt>
            <dd className="text-lg leading-none font-bold text-green tabular-nums">{modules.length}</dd>
          </div>
          <div className="rounded-xl bg-[#F3F6FB] px-3 py-2 text-center">
            <dt className="text-[11px] font-medium text-ink/45">Permissions</dt>
            <dd className="text-lg leading-none font-bold text-navy tabular-nums">{permissionCount}</dd>
          </div>
        </dl>
      </div>

      {modules.length ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {modules.map((group) => {
            const permissions = Array.isArray(group.permissions) ? group.permissions : []
            return (
              <li key={group.module} className="rounded-xl border border-ink/[0.06] bg-[#F7FBF9] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-navy">{moduleLabel(group.module)}</h3>
                  <p className="text-xs font-medium text-ink/45 tabular-nums">
                    {permissions.length} {permissions.length === 1 ? 'permission' : 'permissions'}
                  </p>
                </div>
                {permissions.length ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {permissions.map((item) => (
                      <li
                        key={item.id ?? item.name}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy ring-1 ring-ink/10"
                        title={item.name}
                      >
                        {permissionLabel(item.name, group.module)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink/45">No permissions in this module.</p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl bg-[#F7FBF9] px-4 py-6 text-sm text-ink/55">No role permissions were returned.</p>
      )}
    </section>
  )
}
