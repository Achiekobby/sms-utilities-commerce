import { useEffect, useState } from 'react'
import { useNotify } from '../../../../features/notifications/useNotify'
import { permissionItems, readBrowserPermissions, requestBrowserPermission } from './browserPermissions'
import { PermissionRow } from './PermissionRow'
import { cardClass } from './ui'

function moduleLabel(module) {
  return String(module)
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function PermissionsSettings({ profile }) {
  const notify = useNotify()
  const modules = Array.isArray(profile?.role?.permissions) ? profile.role.permissions : []
  const permissionCount = modules.reduce((total, group) => total + (group.permissions?.length ?? 0), 0)
  const [states, setStates] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    let active = true
    readBrowserPermissions().then(
      (next) => {
        if (active) setStates(next)
      },
      () => {
        if (active) setError('This browser could not report permission status.')
      },
    )
    return () => {
      active = false
    }
  }, [])

  async function allow(id) {
    setBusyId(id)
    try {
      const next = await requestBrowserPermission(id)
      setStates((current) => ({ ...current, [id]: next }))
      if (next === 'allowed') notify.success('Permission allowed in this browser.')
      else if (next === 'blocked') notify.error('The browser blocked this permission.')
    } catch {
      const refreshed = await readBrowserPermissions()
      setStates(refreshed)
      notify.error('The browser did not grant this permission.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className={cardClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-navy">Role access</h2>
          <p className="text-xs text-ink/45">
            {permissionCount} {permissionCount === 1 ? 'permission' : 'permissions'}
          </p>
        </div>
        <p className="mt-1 text-sm leading-6 text-ink/60">
          {profile?.role?.name || 'This role'} decides which admin pages you can open. It is not edited here.
        </p>
        {modules.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {modules.map((group) => (
              <li key={group.module} className="rounded-full bg-[#F3F6FB] px-2.5 py-1 text-xs font-medium text-navy">
                {moduleLabel(group.module)}
                <span className="sr-only">
                  {`, ${group.permissions?.map((item) => item.name).join(', ') || 'no permissions'}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink/55">No role permissions were returned.</p>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="text-base font-semibold text-navy">Browser permissions</h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
          Device features this browser can use. A blocked permission has to be changed in the browser settings.
        </p>
        {error ? (
          <p className="mt-4 text-sm text-[#9F1C26]" role="alert">
            {error}
          </p>
        ) : null}
        {!states && !error ? <p className="mt-4 text-sm text-ink/55">Checking this browser…</p> : null}
        {states ? (
          <ul className="mt-2">
            {permissionItems.map((item) => (
              <PermissionRow
                key={item.id}
                item={item}
                state={states[item.id]}
                busy={busyId === item.id}
                onAllow={() => allow(item.id)}
              />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
