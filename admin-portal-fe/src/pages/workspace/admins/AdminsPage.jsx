import { ChevronLeft, ChevronRight, Search, ShieldCheck, UserPlus } from 'lucide-react'
import { useId, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router'
import { adminMatches, adminName, sameAdmin } from '../../../features/admins/adminModel'
import { useSyncSelf } from '../../../features/admins/useSyncSelf'
import { selectCurrentUser } from '../../../features/auth/authSlice'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { labelize, pageWindow } from '../../../features/clients/clientModel'
import { useNotify } from '../../../features/notifications/useNotify'
import { formatPhone, formatWhen } from '../../../features/onboarding/clientOnboarding'
import { paths } from '../../../routes/paths'
import { useDeleteAdminMutation, useGetAdminsQuery, useUpdateAdminStatusMutation } from '../../../services/api/admins/adminsApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { ConfirmDialog } from '../profile/settings/ConfirmDialog'
import { AdminAvatar } from './AdminAvatar'
import { AdminDrawer } from './AdminDrawer'
import { AdminRowMenu } from './AdminRowMenu'
import { cardClass, cellClass, focusClass, headClass } from './ui'

const statuses = [
  { id: '', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
]

export function AdminsPage() {
  const access = usePermissions()
  const allowed = access.hasPermission('admin.manage')
  const canOnboard = access.hasPermission('onboarding.admin')
  const currentId = useSelector(selectCurrentUser)?.id
  const syncSelf = useSyncSelf()
  const notify = useNotify()
  const searchId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [menuId, setMenuId] = useState(null)
  const [panel, setPanel] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateAdminStatusMutation()
  const [deleteAdmin, { isLoading: deleting }] = useDeleteAdminMutation()
  const requestedPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAdminsQuery(
    { page: requestedPage },
    { skip: !allowed },
  )

  if (!allowed) return <AccessDeniedPage />

  const admins = Array.isArray(data?.data) ? data.data : []
  const narrowed = Boolean(query.trim()) || Boolean(status)
  const visible = admins.filter((admin) => adminMatches(admin, query) && (!status || admin.status === status))
  const pages = pageWindow(
    data?.pagination ?? {
      current_page: requestedPage,
      per_page: admins.length || 15,
      total: admins.length,
      last_page: 1,
    },
  )
  const waiting = isLoading && !data

  function openPage(next) {
    setSearchParams(next <= 1 ? {} : { page: String(next) }, { replace: true })
  }

  function openPanel(id, mode, focus = false) {
    setMenuId(null)
    setPanel({ id, mode, focus })
  }

  async function confirmStatus() {
    if (!statusTarget) return
    const nextStatus = statusTarget.status === 'active' ? 'inactive' : 'active'
    try {
      const result = await updateStatus({ id: statusTarget.id, status: nextStatus }).unwrap()
      syncSelf(result?.data)
      setStatusTarget(null)
      setStatusError('')
      notify.success(result?.message || 'Admin status updated.')
    } catch (statusFailure) {
      const message = apiErrorMessage(statusFailure)
      setStatusError(message)
      notify.error(message)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      const result = await deleteAdmin(deleteTarget.id).unwrap()
      if (panel && sameAdmin(panel.id, deleteTarget.id)) setPanel(null)
      if (admins.length === 1 && requestedPage > 1) openPage(requestedPage - 1)
      setDeleteTarget(null)
      setDeleteError('')
      notify.success(result?.message || 'Admin deleted.')
    } catch (deleteFailure) {
      const message = apiErrorMessage(deleteFailure)
      setDeleteError(message)
      notify.error(message)
    }
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F8F0] text-green ring-1 ring-green/15">
              <ShieldCheck size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Access & security</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Admins</h1>
                <span
                  aria-live="polite"
                  className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums"
                >
                  {waiting ? '…' : pages.total}
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">
                Team members who can sign in. Each person’s role decides what they can manage.
              </p>
            </div>
          </div>
          {canOnboard ? (
            <Link
              to={paths.adminOnboarding}
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] sm:self-center ${focusClass}`}
            >
              <UserPlus size={16} strokeWidth={2.2} aria-hidden="true" />
              Add admin
            </Link>
          ) : null}
        </div>

        <div className="border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={searchId} className="sr-only">
                Search admins on this page
              </label>
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35"
              />
              <input
                id={searchId}
                value={query}
                placeholder="Search name, email, phone, or role"
                onChange={(event) => setQuery(event.target.value)}
                className={`h-11 w-full rounded-xl border border-ink/10 bg-white pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-green ${focusClass}`}
              />
            </div>
            <div className="flex items-center gap-2" role="group" aria-label="Status">
              {statuses.map((item) => {
                const selected = status === item.id
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStatus(item.id)}
                    className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold ${focusClass} ${
                      selected ? 'bg-navy text-white' : 'border border-ink/10 bg-white text-navy hover:border-green/40'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
            {narrowed && !waiting ? (
              <p className="text-sm whitespace-nowrap text-ink/50" aria-live="polite">
                {visible.length} shown
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <section className={`${cardClass} mt-5`} aria-busy={isFetching || undefined}>
        {isError && !admins.length ? (
          <div className="rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-4 py-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {waiting ? <AdminSkeleton /> : null}

        {!waiting && !isError && !admins.length ? (
          <div className="mt-8 mb-4 text-center">
            <p className="text-sm font-semibold text-navy">No admins yet</p>
            <p className="mt-1 text-sm text-ink/55">Onboard a teammate and they will appear here after the invite is sent.</p>
          </div>
        ) : null}

        {!waiting && admins.length ? (
          <>
            {visible.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-left">
                  <thead>
                    <tr>
                      {['Admin', 'Role', 'Phone', 'Status', 'Last sign-in'].map((label) => (
                        <th key={label} scope="col" className={headClass}>
                          {label}
                        </th>
                      ))}
                      <th scope="col" className={`${headClass} text-right`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((admin) => {
                      const name = adminName(admin)
                      const yours = sameAdmin(admin.id, currentId)
                      return (
                        <tr
                          key={admin.id}
                          className="cursor-pointer hover:bg-[#F7FAF8]"
                          onClick={() => openPanel(admin.id, 'view')}
                        >
                          <th scope="row" className={`${cellClass} font-medium text-navy`}>
                            <span className="flex min-w-0 items-center gap-3">
                              <AdminAvatar admin={admin} />
                              <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                  <span className="truncate">{name}</span>
                                  {yours ? (
                                    <span className="rounded-full bg-[#E7F0FF] px-2 py-0.5 text-[11px] font-semibold text-blue">You</span>
                                  ) : null}
                                </span>
                                <span className="block truncate text-xs font-normal text-ink/50">{admin.email}</span>
                              </span>
                            </span>
                          </th>
                          <td className={cellClass}>{admin.role?.name || '—'}</td>
                          <td className={cellClass}>{formatPhone(admin.phone_number) || '—'}</td>
                          <td className={cellClass}>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                admin.status === 'active' ? 'bg-[#E7F8F0] text-green' : 'bg-[#F3F6FB] text-navy'
                              }`}
                            >
                              {labelize(admin.status) || 'Unknown'}
                            </span>
                          </td>
                          <td className={cellClass}>{formatWhen(admin.last_login_at) || 'Never'}</td>
                          <td className={`${cellClass} text-right`} onClick={(event) => event.stopPropagation()}>
                            <AdminRowMenu
                              name={name}
                              active={admin.status === 'active'}
                              open={menuId === admin.id}
                              onToggle={() => setMenuId((current) => (current === admin.id ? null : admin.id))}
                              onClose={() => setMenuId((current) => (current === admin.id ? null : current))}
                              onView={() => openPanel(admin.id, 'view')}
                              onEdit={() => openPanel(admin.id, 'edit')}
                              onAssign={() => openPanel(admin.id, 'view', true)}
                              onStatus={
                                yours
                                  ? undefined
                                  : () => {
                                      setStatusError('')
                                      setStatusTarget(admin)
                                    }
                              }
                              onDelete={
                                yours
                                  ? undefined
                                  : () => {
                                      setDeleteError('')
                                      setDeleteTarget(admin)
                                    }
                              }
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-8 mb-2 text-center" role="status">
                <p className="text-sm font-semibold text-navy">No admins match</p>
                <p className="mt-1 text-sm text-ink/55">Nothing on this page fits the search or status.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setStatus('')
                  }}
                  className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-green/40 ${focusClass}`}
                >
                  Clear search and status
                </button>
              </div>
            )}
            <Pagination pages={pages} onPage={openPage} />
            {pages.lastPage > 1 && narrowed ? (
              <p className="mt-3 text-xs text-ink/45">Search and status check the admins loaded on this page.</p>
            ) : null}
          </>
        ) : null}
      </section>

      {panel ? (
        <AdminDrawer
          id={panel.id}
          mode={panel.mode}
          focusRole={panel.focus}
          self={sameAdmin(panel.id, currentId)}
          onClose={() => setPanel(null)}
          onMode={(mode) => setPanel((current) => (current ? { ...current, mode, focus: false } : current))}
          onStatus={
            sameAdmin(panel.id, currentId)
              ? undefined
              : (admin) => {
                  setStatusError('')
                  setStatusTarget(admin)
                }
          }
          onDelete={
            sameAdmin(panel.id, currentId)
              ? undefined
              : (admin) => {
                  setDeleteError('')
                  setDeleteTarget(admin)
                }
          }
        />
      ) : null}

      {statusTarget ? (
        <ConfirmDialog
          title={statusTarget.status === 'active' ? `Deactivate ${adminName(statusTarget)}?` : `Activate ${adminName(statusTarget)}?`}
          description={
            statusTarget.status === 'active'
              ? 'They stay on the team, and the account stays inactive until you turn it back on.'
              : 'They will be able to sign in again.'
          }
          confirmLabel={statusTarget.status === 'active' ? 'Deactivate admin' : 'Activate admin'}
          tone={statusTarget.status === 'active' ? 'warning' : 'caution'}
          error={statusError}
          busy={updatingStatus}
          onConfirm={confirmStatus}
          onClose={() => {
            if (updatingStatus) return
            setStatusTarget(null)
            setStatusError('')
          }}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title={`Delete ${adminName(deleteTarget)}?`}
          description="Their admin account is removed. This cannot be undone."
          confirmLabel="Delete admin"
          tone="danger"
          error={deleteError}
          busy={deleting}
          onConfirm={confirmDelete}
          onClose={() => {
            if (deleting) return
            setDeleteTarget(null)
            setDeleteError('')
          }}
        />
      ) : null}
    </div>
  )
}

function pageNumbers(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)
  const picked = new Set([1, last, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((page) => picked.add(page))
  if (current >= last - 2) [last - 3, last - 2, last - 1].forEach((page) => picked.add(page))
  const sorted = [...picked].filter((page) => page >= 1 && page <= last).sort((left, right) => left - right)
  const numbers = []
  sorted.forEach((page, index) => {
    if (index && page - sorted[index - 1] > 1) numbers.push(`gap-${page}`)
    numbers.push(page)
  })
  return numbers
}

function Pagination({ pages, onPage }) {
  if (!pages.total) return null
  const numbers = pageNumbers(pages.current, pages.lastPage)
  return (
    <nav className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Admin pages">
      <p className="text-sm text-ink/50">
        Showing {pages.from}–{pages.to} of {pages.total}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPage(pages.current - 1)}
          disabled={pages.current <= 1}
          className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-ink/10 px-2.5 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Previous
        </button>
        {numbers.map((page) =>
          typeof page === 'string' ? (
            <span key={page} className="px-1 text-sm text-ink/35" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-label={`Page ${page}`}
              aria-current={page === pages.current ? 'page' : undefined}
              onClick={() => onPage(page)}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold ${focusClass} ${
                page === pages.current ? 'bg-navy text-white' : 'border border-ink/10 text-navy hover:bg-[#F4FBF7]'
              }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(pages.current + 1)}
          disabled={pages.current >= pages.lastPage}
          className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-ink/10 px-2.5 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          Next
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

function AdminSkeleton() {
  return (
    <div className="mt-5 space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="skeleton size-9 rounded-full" />
          <div className="skeleton h-4 w-48 rounded-md" />
        </div>
      ))}
    </div>
  )
}
