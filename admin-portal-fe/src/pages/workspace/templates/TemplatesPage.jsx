import { ChevronLeft, ChevronRight, FileText, Plus, Search, X } from 'lucide-react'
import { useId, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { pageWindow } from '../../../features/clients/clientModel'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  formatTemplateWhen,
  labelize,
  templateMatches,
  templateStatusTone,
  templateTypeLabel,
  templateTypes,
  templateStatuses,
} from '../../../features/templates/templateModel'
import { paths } from '../../../routes/paths'
import {
  useDeleteTemplateMutation,
  useGetTemplatesQuery,
  useSetTemplateStatusMutation,
} from '../../../services/api/templates/templatesApi'
import { ConfirmDialog } from '../profile/settings/ConfirmDialog'
import { TemplateRowMenu } from './TemplateRowMenu'
import { cardClass, cellClass, focusClass, headClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  )
}

function pageList(current, lastPage) {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap', lastPage]
  if (current >= lastPage - 3) return [1, 'gap', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage]
  return [1, 'gap', current - 1, current, current + 1, 'gap-end', lastPage]
}

function Pagination({ pages, onPage }) {
  if (pages.lastPage < 2) return null
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-ink/60 tabular-nums">
        Showing {pages.from}–{pages.to} of {pages.total}
      </p>
      <nav aria-label="Template pages" className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={pages.current <= 1}
          onClick={() => onPage(pages.current - 1)}
          className={`flex size-8 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 hover:border-blue/40 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
        {pageList(pages.current, pages.lastPage).map((item) =>
          typeof item === 'string' ? (
            <span key={item} aria-hidden="true" className="px-1 text-ink/40">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === pages.current ? 'page' : undefined}
              onClick={() => onPage(item)}
              className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-[13px] font-semibold tabular-nums ${focusClass} ${
                item === pages.current
                  ? 'border border-blue bg-blue text-white'
                  : 'border border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={pages.current >= pages.lastPage}
          onClick={() => onPage(pages.current + 1)}
          className={`flex size-8 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 hover:border-blue/40 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}

function TemplateSkeleton() {
  return (
    <div role="status" className="space-y-2">
      <span className="sr-only">Loading templates</span>
      {Array.from({ length: 6 }, (_, index) => (
        <span key={index} className="skeleton block h-12 rounded-lg" />
      ))}
    </div>
  )
}

export function TemplatesPage() {
  const searchId = useId()
  const navigate = useNavigate()
  const notify = useNotify()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = templateTypes.some((item) => item.value === (searchParams.get('type') ?? ''))
    ? searchParams.get('type') ?? ''
    : ''
  const status = templateStatuses.some((item) => item.value === (searchParams.get('status') ?? ''))
    ? searchParams.get('status') ?? ''
    : ''
  const requestedPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const [query, setQuery] = useState('')
  const [menuId, setMenuId] = useState(null)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [actionError, setActionError] = useState('')
  const { data, isLoading, isFetching, isError, error, refetch } = useGetTemplatesQuery({
    page: requestedPage,
    type,
    status,
  })
  const [setTemplateStatus, statusState] = useSetTemplateStatusMutation()
  const [deleteTemplate, deleteState] = useDeleteTemplateMutation()
  const actionBusy = statusState.isLoading || deleteState.isLoading

  const records = Array.isArray(data?.data) ? data.data : []
  const visible = records.filter((template) => templateMatches(template, query))
  const pages = pageWindow(
    data?.pagination ?? {
      current_page: requestedPage,
      per_page: records.length || 15,
      total: records.length,
      last_page: 1,
    },
  )
  const waiting = isLoading && !data
  const filtered = Boolean(type || status || query.trim())

  function writeParams(next) {
    const params = {}
    if (next.page > 1) params.page = String(next.page)
    if (next.type) params.type = next.type
    if (next.status) params.status = next.status
    setSearchParams(params, { replace: true })
  }

  function clearFilters() {
    setQuery('')
    writeParams({ page: 1, type: '', status: '' })
  }

  function askStatusChange(template) {
    if (!template || actionBusy) return
    setActionError('')
    setPendingStatus(template)
  }

  async function confirmStatusChange() {
    if (!pendingStatus || statusState.isLoading) return
    const nextStatus = String(pendingStatus.status ?? '').toLowerCase() === 'active' ? 'inactive' : 'active'
    setActionError('')
    try {
      const result = await setTemplateStatus({ id: pendingStatus.id, status: nextStatus }).unwrap()
      notify.success(
        result?.message || (nextStatus === 'active' ? 'Template activated.' : 'Template deactivated.'),
      )
      setPendingStatus(null)
    } catch (failure) {
      setActionError(apiErrorMessage(failure))
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deleteState.isLoading) return
    setActionError('')
    try {
      const result = await deleteTemplate(pendingDelete.id).unwrap()
      notify.success(result?.message || 'Template deleted.')
      setPendingDelete(null)
    } catch (failure) {
      setActionError(apiErrorMessage(failure))
    }
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0FF] text-blue ring-1 ring-blue/15">
              <FileText size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">Messaging</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">All Templates</h1>
                <span
                  aria-live="polite"
                  className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums"
                >
                  {waiting ? '…' : pages.total}
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">
                System and global SMS templates for campaigns, surveys, and bulk sends.
              </p>
            </div>
          </div>
          <Link
            to={paths.newTemplate}
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] sm:self-center ${focusClass}`}
          >
            <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
            Add Template
          </Link>
        </div>

        <div className="border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={searchId} className="sr-only">
                Search templates on this page
              </label>
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35"
              />
              <input
                id={searchId}
                type="search"
                value={query}
                placeholder="Search name, category, body, or placeholder"
                onChange={(event) => setQuery(event.target.value)}
                className={`h-11 w-full rounded-xl border border-ink/10 bg-white pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-blue ${focusClass}`}
              />
            </div>
            <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
              {templateTypes.map((item) => {
                const selected = type === item.value
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => writeParams({ page: 1, type: item.value, status })}
                    className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold ${focusClass} ${
                      selected ? 'border-blue bg-[#E7F0FF] text-navy' : 'border-ink/10 bg-white text-ink/70 hover:border-blue/40'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div role="group" aria-label="Filter by status" className="mt-2 flex flex-wrap gap-2">
            {templateStatuses.map((item) => {
              const selected = status === item.value
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => writeParams({ page: 1, type, status: item.value })}
                  className={`inline-flex h-8 cursor-pointer items-center rounded-full border px-2.5 text-[13px] font-semibold ${focusClass} ${
                    selected ? 'border-navy bg-navy text-white' : 'border-ink/10 bg-white text-ink/65 hover:border-blue/40'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          {filtered ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {type ? (
                <button
                  type="button"
                  aria-label={`Remove ${templateTypeLabel(type)} filter`}
                  onClick={() => writeParams({ page: 1, type: '', status })}
                  className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 text-sm font-medium text-navy ${focusClass}`}
                >
                  <span aria-hidden="true">{templateTypeLabel(type)}</span>
                  <X size={14} strokeWidth={2.2} aria-hidden="true" />
                </button>
              ) : null}
              {status ? (
                <button
                  type="button"
                  aria-label={`Remove ${labelize(status)} filter`}
                  onClick={() => writeParams({ page: 1, type, status: '' })}
                  className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 text-sm font-medium text-navy ${focusClass}`}
                >
                  <span aria-hidden="true">{labelize(status)}</span>
                  <X size={14} strokeWidth={2.2} aria-hidden="true" />
                </button>
              ) : null}
              <button type="button" onClick={clearFilters} className={`text-sm font-semibold text-blue ${focusClass}`}>
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <section className={`${cardClass} mt-5`} aria-busy={isFetching || undefined}>
        {isError && !records.length ? (
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

        {waiting ? <TemplateSkeleton /> : null}

        {!waiting && !isError && !records.length ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-navy">{filtered ? 'No templates match' : 'No templates yet'}</p>
            <p className="mt-1 text-sm text-ink/55">
              {filtered ? 'Try another type or status.' : 'Templates created for campaigns and surveys will show up here.'}
            </p>
            {filtered ? (
              <button
                type="button"
                onClick={clearFilters}
                className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-blue/40 ${focusClass}`}
              >
                Clear filters
              </button>
            ) : (
              <Link
                to={paths.newTemplate}
                className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
              >
                <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
                Add Template
              </Link>
            )}
          </div>
        ) : null}

        {!waiting && records.length ? (
          <>
            {visible.length ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[64rem] border-separate border-spacing-0 text-left">
                    <thead>
                      <tr>
                        {['Template', 'Type', 'Category', 'Status', 'Placeholders', 'Updated', 'Actions'].map((label) => (
                          <th key={label} scope="col" className={headClass}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((template) => {
                        const placeholders = Array.isArray(template.placeholders) ? template.placeholders : []
                        const questions = Array.isArray(template.questions) ? template.questions : []
                        return (
                          <tr key={template.id} className="hover:bg-[#F7FAFC]">
                            <th scope="row" className={`${cellClass} max-w-xs font-normal`}>
                              <Link
                                to={paths.template(template.id)}
                                className={`font-semibold text-navy hover:text-blue ${focusClass}`}
                              >
                                {template.name || 'Untitled'}
                              </Link>
                              <p className="mt-0.5 truncate text-xs text-ink/55">
                                {template.description || template.body || '—'}
                              </p>
                              <p className="mt-1 text-[11px] font-medium text-ink/45">
                                {template.is_system ? 'System' : template.scope || 'Custom'}
                                {questions.length ? ` · ${questions.length} questions` : ''}
                              </p>
                            </th>
                            <td className={cellClass}>
                              <Badge>{templateTypeLabel(template.type)}</Badge>
                              {template.occasion_type ? (
                                <p className="mt-1 text-xs text-ink/50">{labelize(template.occasion_type)}</p>
                              ) : null}
                            </td>
                            <td className={cellClass}>{labelize(template.category) || '—'}</td>
                            <td className={cellClass}>
                              <Badge tone={templateStatusTone(template.status)}>
                                {labelize(template.status) || 'Unknown'}
                              </Badge>
                            </td>
                            <td className={cellClass}>
                              {placeholders.length ? (
                                <div className="flex max-w-[14rem] flex-wrap gap-1">
                                  {placeholders.slice(0, 3).map((item) => (
                                    <span
                                      key={item}
                                      className="rounded-md bg-[#F3F6FB] px-1.5 py-0.5 font-mono text-[11px] text-navy"
                                    >
                                      {`{${item}}`}
                                    </span>
                                  ))}
                                  {placeholders.length > 3 ? (
                                    <span className="text-xs text-ink/45">+{placeholders.length - 3}</span>
                                  ) : null}
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className={`${cellClass} whitespace-nowrap`}>
                              {formatTemplateWhen(template.updated_at || template.created_at)}
                            </td>
                            <td className={cellClass}>
                              <TemplateRowMenu
                                name={template.name || 'Untitled'}
                                status={template.status}
                                open={menuId === template.id}
                                onToggle={() => setMenuId((current) => (current === template.id ? null : template.id))}
                                onClose={() => setMenuId(null)}
                                onView={() => navigate(paths.template(template.id))}
                                onEdit={() => navigate(paths.editTemplate(template.id))}
                                onStatus={() => askStatusChange(template)}
                                onDelete={() => {
                                  setActionError('')
                                  setPendingDelete(template)
                                }}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <ul className="divide-y divide-ink/[0.06] md:hidden">
                  {visible.map((template) => {
                    const placeholders = Array.isArray(template.placeholders) ? template.placeholders : []
                    return (
                      <li key={template.id} className="py-3.5 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={paths.template(template.id)}
                              className={`font-semibold text-navy hover:text-blue ${focusClass}`}
                            >
                              {template.name || 'Untitled'}
                            </Link>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-ink/55">
                              {template.description || template.body || '—'}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge tone={templateStatusTone(template.status)}>{labelize(template.status) || '—'}</Badge>
                            <TemplateRowMenu
                              name={template.name || 'Untitled'}
                              status={template.status}
                              open={menuId === template.id}
                              onToggle={() => setMenuId((current) => (current === template.id ? null : template.id))}
                              onClose={() => setMenuId(null)}
                              onView={() => navigate(paths.template(template.id))}
                              onEdit={() => navigate(paths.editTemplate(template.id))}
                              onStatus={() => askStatusChange(template)}
                              onDelete={() => {
                                setActionError('')
                                setPendingDelete(template)
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-ink/55">
                          <Badge>{templateTypeLabel(template.type)}</Badge>
                          {template.category ? <span>{labelize(template.category)}</span> : null}
                          <span>{formatTemplateWhen(template.updated_at || template.created_at)}</span>
                        </div>
                        {placeholders.length ? (
                          <p className="mt-2 font-mono text-[11px] text-ink/45">
                            {placeholders.map((item) => `{${item}}`).join(' · ')}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <div className="py-8 text-center" role="status">
                <p className="text-sm font-semibold text-navy">No templates match</p>
                <p className="mt-1 text-sm text-ink/55">Nothing on this page fits “{query.trim()}”.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-blue/40 ${focusClass}`}
                >
                  Clear search
                </button>
              </div>
            )}
            <Pagination pages={pages} onPage={(next) => writeParams({ page: next, type, status })} />
            {pages.lastPage > 1 && query.trim() ? (
              <p className="mt-3 text-xs text-ink/45">Search checks the templates loaded on this page.</p>
            ) : null}
          </>
        ) : null}
      </section>

      {pendingStatus ? (
        <ConfirmDialog
          title={
            String(pendingStatus.status ?? '').toLowerCase() === 'active'
              ? `Deactivate ${pendingStatus.name || 'template'}?`
              : `Activate ${pendingStatus.name || 'template'}?`
          }
          description={
            String(pendingStatus.status ?? '').toLowerCase() === 'active'
              ? 'It stays in the library but won’t be used for new sends until activated again.'
              : 'This template will be available for campaigns and SMS again.'
          }
          confirmLabel={
            String(pendingStatus.status ?? '').toLowerCase() === 'active'
              ? 'Deactivate template'
              : 'Activate template'
          }
          tone={String(pendingStatus.status ?? '').toLowerCase() === 'active' ? 'warning' : 'caution'}
          error={actionError}
          busy={statusState.isLoading}
          onConfirm={confirmStatusChange}
          onClose={() => {
            if (statusState.isLoading) return
            setPendingStatus(null)
            setActionError('')
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title={`Delete ${pendingDelete.name || 'template'}?`}
          description="This permanently removes the template from the platform."
          confirmLabel="Delete template"
          tone="danger"
          error={actionError}
          busy={deleteState.isLoading}
          onConfirm={confirmDelete}
          onClose={() => {
            if (deleteState.isLoading) return
            setPendingDelete(null)
            setActionError('')
          }}
        />
      ) : null}
    </div>
  )
}
