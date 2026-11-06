import { ChevronLeft, ChevronRight, Plus, Search, Shield } from 'lucide-react'
import { useId, useState } from 'react'
import { useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { pageWindow } from '../../../features/clients/clientModel'
import { countPermissions, moduleLabel, permissionCatalog } from '../../../features/roles/roleModel'
import { useGetRolesQuery } from '../../../services/api/roles/rolesApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { RoleDrawer } from './RoleDrawer'
import { cardClass, focusClass } from './ui'

export function RolesPage() {
  const access = usePermissions()
  const allowed = access.hasPermission('role.manage')
  const searchId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [panel, setPanel] = useState(null)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetRolesQuery({ page }, { skip: !allowed })

  if (!allowed) return <AccessDeniedPage />

  const roles = Array.isArray(data?.data) ? data.data : []
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? roles.filter((role) => `${role.name ?? ''} ${role.description ?? ''}`.toLowerCase().includes(needle))
    : roles
  const pages = pageWindow(data?.pagination ?? { current_page: page, per_page: roles.length || 15, total: roles.length, last_page: 1 })
  const waiting = isLoading && !data

  function openPage(next) {
    setSearchParams(next <= 1 ? {} : { page: String(next) }, { replace: true })
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F6FB] text-navy ring-1 ring-navy/10">
              <Shield size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">Access & security</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Roles</h1>
                <span aria-live="polite" className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums">
                  {waiting ? '…' : pages.total}
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">Name a role, describe it, and choose the permissions it can use.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPanel({ mode: 'create' })}
            className={`inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] sm:self-center ${focusClass}`}
          >
            <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
            New role
          </button>
        </div>
        <div className="border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:px-6">
          <div className="relative max-w-md">
            <label htmlFor={searchId} className="sr-only">
              Search roles on this page
            </label>
            <Search size={16} strokeWidth={2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35" />
            <input
              id={searchId}
              type="search"
              value={query}
              placeholder="Search role name or description"
              onChange={(event) => setQuery(event.target.value)}
              className={`h-11 w-full rounded-xl border border-ink/10 bg-white pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-green ${focusClass}`}
            />
          </div>
        </div>
      </header>

      <section className="mt-5" aria-busy={isFetching || undefined}>
        {isError && !roles.length ? (
          <div className="rounded-2xl border border-[#E0232E]/20 bg-[#FDECEE] px-5 py-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button type="button" onClick={refetch} className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}
        {waiting ? (
          <ul className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="skeleton h-44 rounded-2xl" />
            ))}
          </ul>
        ) : null}
        {!waiting && !isError && !roles.length ? (
          <div className={`${cardClass} py-10 text-center`}>
            <p className="text-sm font-semibold text-navy">No roles yet</p>
            <p className="mt-1 text-sm text-ink/55">Create a role and attach the permissions it should have.</p>
          </div>
        ) : null}
        {!waiting && roles.length ? (
          <>
            {visible.length ? (
              <ul className="grid gap-4 lg:grid-cols-2">
                {visible.map((role) => {
                  const groups = permissionCatalog(role.permissions)
                  const total = countPermissions(groups)
                  return (
                    <li key={role.id}>
                      <article
                        className="flex h-full cursor-pointer flex-col rounded-2xl border border-ink/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)] transition-colors hover:border-green/40"
                        onClick={() => setPanel({ mode: 'view', id: role.id })}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setPanel({ mode: 'view', id: role.id })
                            }}
                            className={`text-left text-lg font-bold tracking-tight text-navy ${focusClass}`}
                          >
                            {role.name}
                          </button>
                          <span className="shrink-0 rounded-full bg-[#F3F6FB] px-2 py-0.5 text-[11px] font-semibold text-navy tabular-nums">
                            {total}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{role.description}</p>
                        <ul className="mt-4 flex flex-wrap gap-1.5">
                          {groups.slice(0, 4).map((group) => (
                            <li key={group.module} className="rounded-full bg-[#F7FBF9] px-2.5 py-1 text-xs font-medium text-navy">
                              {moduleLabel(group.module)}
                            </li>
                          ))}
                          {groups.length > 4 ? <li className="px-1 py-1 text-xs text-ink/45">+{groups.length - 4}</li> : null}
                        </ul>
                      </article>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className={`${cardClass} py-10 text-center`} role="status">
                <p className="text-sm font-semibold text-navy">No roles match</p>
                <p className="mt-1 text-sm text-ink/55">Nothing on this page fits “{query.trim()}”.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy ${focusClass}`}
                >
                  Clear search
                </button>
              </div>
            )}
            <Pagination pages={pages} onPage={openPage} />
            {pages.lastPage > 1 && needle ? <p className="mt-3 text-xs text-ink/45">Search checks the roles loaded on this page.</p> : null}
          </>
        ) : null}
      </section>

      {panel ? (
        <RoleDrawer
          mode={panel.mode}
          id={panel.id}
          onClose={() => setPanel(null)}
          onEdit={() => setPanel({ mode: 'edit', id: panel.id })}
        />
      ) : null}
    </div>
  )
}

function pageNumbers(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)
  const picked = new Set([1, last, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((item) => picked.add(item))
  if (current >= last - 2) [last - 3, last - 2, last - 1].forEach((item) => picked.add(item))
  const sorted = [...picked].filter((item) => item >= 1 && item <= last).sort((left, right) => left - right)
  const numbers = []
  sorted.forEach((item, index) => {
    if (index && item - sorted[index - 1] > 1) numbers.push(`gap-${item}`)
    numbers.push(item)
  })
  return numbers
}

function Pagination({ pages, onPage }) {
  if (!pages.total) return null
  const numbers = pageNumbers(pages.current, pages.lastPage)
  return (
    <nav className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Role pages">
      <p className="text-sm text-ink/50">
        Showing {pages.from}–{pages.to} of {pages.total}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPage(pages.current - 1)}
          disabled={pages.current <= 1}
          className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-ink/10 px-2.5 text-sm font-semibold text-navy disabled:opacity-40 ${focusClass}`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Previous
        </button>
        {numbers.map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="px-1 text-sm text-ink/35" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === pages.current ? 'page' : undefined}
              onClick={() => onPage(item)}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold ${focusClass} ${
                item === pages.current ? 'bg-navy text-white' : 'border border-ink/10 text-navy hover:bg-[#F4F7FB]'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(pages.current + 1)}
          disabled={pages.current >= pages.lastPage}
          className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-ink/10 px-2.5 text-sm font-semibold text-navy disabled:opacity-40 ${focusClass}`}
        >
          Next
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
