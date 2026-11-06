import { LockKeyhole, Search } from 'lucide-react'
import { useId, useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { countPermissions, moduleLabel, permissionCatalog, permissionLabel } from '../../../features/roles/roleModel'
import { useGetPermissionsQuery } from '../../../services/api/roles/rolesApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { focusClass } from './ui'

export function PermissionsPage() {
  const access = usePermissions()
  const allowed = access.hasPermission('permission.manage')
  const searchId = useId()
  const [query, setQuery] = useState('')
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPermissionsQuery(undefined, { skip: !allowed })

  if (!allowed) return <AccessDeniedPage />

  const catalog = permissionCatalog(data?.data)
  const needle = query.trim().toLowerCase()
  const visible = catalog
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((item) => {
        if (!needle) return true
        return `${group.module} ${moduleLabel(group.module)} ${item.name} ${permissionLabel(item.name, group.module)}`.toLowerCase().includes(needle)
      }),
    }))
    .filter((group) => group.permissions.length)
  const total = countPermissions(catalog)
  const waiting = isLoading && !data

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex min-w-0 items-center gap-4 px-5 py-5 sm:px-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F6FB] text-navy ring-1 ring-navy/10">
            <LockKeyhole size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">Access & security</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Permissions</h1>
              <span aria-live="polite" className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums">
                {waiting ? '…' : total}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">Every permission on the platform, grouped by the area it covers.</p>
          </div>
        </div>
        <div className="border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:px-6">
          <div className="relative max-w-md">
            <label htmlFor={searchId} className="sr-only">
              Search permissions
            </label>
            <Search size={16} strokeWidth={2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35" />
            <input
              id={searchId}
              type="search"
              value={query}
              placeholder="Search module or permission"
              onChange={(event) => setQuery(event.target.value)}
              className={`h-11 w-full rounded-xl border border-ink/10 bg-white pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-green ${focusClass}`}
            />
          </div>
        </div>
      </header>

      <section className="mt-5" aria-busy={isFetching || undefined}>
        {isError ? (
          <div className="rounded-2xl border border-[#E0232E]/20 bg-[#FDECEE] px-5 py-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button type="button" onClick={refetch} className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}
        {waiting ? (
          <ul className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="skeleton h-28 rounded-2xl" />
            ))}
          </ul>
        ) : null}
        {!waiting && !isError && !visible.length ? (
          <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-10 text-center">
            <p className="text-sm font-semibold text-navy">{needle ? 'No permissions match' : 'No permissions yet'}</p>
            {needle ? (
              <button type="button" onClick={() => setQuery('')} className={`mt-4 text-sm font-semibold text-blue ${focusClass}`}>
                Clear search
              </button>
            ) : null}
          </div>
        ) : null}
        {visible.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {visible.map((group) => (
              <li key={group.module} className="rounded-2xl border border-ink/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(16,33,61,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-navy">{moduleLabel(group.module)}</h2>
                  <p className="text-xs font-medium text-ink/45 tabular-nums">{group.permissions.length}</p>
                </div>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {group.permissions.map((item) => (
                    <li key={item.id} title={item.name} className="rounded-full bg-[#F7FBF9] px-2.5 py-1 text-xs font-medium text-navy">
                      {permissionLabel(item.name, group.module)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
