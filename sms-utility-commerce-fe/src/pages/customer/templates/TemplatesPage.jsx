import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { SelectMenu } from '../../../components/SelectMenu'
import { TypeBadge } from '../../../components/TypeBadge'
import { apiErrorMessage } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import { campaignTypeFromTemplate, displayTypeForBadge } from '../../../features/templates/templateModel'
import { paths } from '../../../routes/paths'
import {
  useDeleteTemplateMutation,
  useGetTemplatesQuery,
  useSetTemplateStatusMutation,
} from '../../../services/api/templates/templatesApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { formatCount } from '../dashboard/format'
import {
  activeTemplateFilterCount,
  emptyTemplateFilters,
  templateFilterChips,
  templatesQueryParams,
} from './query'
import { TemplateFilterDrawer } from './sections/TemplateFilterDrawer'
import { TemplatePreview } from './sections/TemplatePreview'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const pageButton =
  'flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-40'
const pageSizeOptions = [6, 12, 15, 24].map((size) => ({ id: String(size), label: String(size) }))

const statusTone = {
  active: 'bg-[#E5F6EC] text-[#008859]',
  inactive: 'bg-[#F3F6FB] text-ink/55',
  draft: 'bg-[#FFF8EE] text-[#B45F06]',
}

const sourceTabs = [
  {
    id: 'admin',
    step: '1',
    label: 'Admin templates',
    detail: 'Created by Cellogent. You can use them, not edit them.',
    icon: Building2,
  },
  {
    id: 'client',
    step: '2',
    label: 'Your templates',
    detail: 'Created in this workspace. You can edit, pause, or delete them.',
    icon: UserRound,
  },
]

function TemplateSourceTabs({ value, onChange }) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      role="tablist"
      aria-label="Template source"
      className="relative mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-[#E6EEF8] bg-[#F4F7FB] p-1 shadow-[0_1px_2px_rgba(16,33,61,0.04)]"
    >
      {sourceTabs.map((item) => {
        const selected = value === item.id
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`template-tab-${item.id}`}
            aria-selected={selected}
            aria-controls="template-panel"
            onClick={() => {
              if (selected) return
              onChange(item.id)
            }}
            className={`relative z-10 flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-200 ${focusClass} ${
              selected ? 'text-navy' : 'text-ink/55 hover:text-navy'
            }`}
          >
            {selected ? (
              <motion.span
                layoutId="template-source-pill"
                className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(16,33,61,0.08),0_8px_18px_-14px_rgba(16,33,61,0.45)]"
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span
              className={`relative flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold tabular-nums transition-colors duration-200 ${
                selected ? 'bg-blue text-white' : 'bg-white text-ink/45'
              }`}
            >
              {item.step}
            </span>
            <span className="relative min-w-0">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                <Icon size={15} strokeWidth={2.2} aria-hidden="true" className={selected ? 'text-blue' : 'text-ink/40'} />
                {item.label}
              </span>
              <span className="mt-0.5 hidden text-[12px] leading-4 font-medium text-ink/50 sm:block">{item.detail}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }) {
  const key = String(status ?? '').toLowerCase()
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
        statusTone[key] ?? 'bg-[#F3F6FB] text-ink/55'
      }`}
    >
      {key || 'unknown'}
    </span>
  )
}

function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

function Pagination({ page, lastPage, total, pageSize, onPageChange, onPageSize }) {
  const rangeStart = total ? (page - 1) * pageSize + 1 : 0
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] sm:justify-between">
      <p className="text-ink/60 tabular-nums">
        Showing {formatCount(rangeStart)}–{formatCount(rangeEnd)} of {formatCount(total)} templates
      </p>

      <nav aria-label="Template pages" className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={pageButton}
        >
          <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>

        {pageList(page, lastPage).map((item) =>
          typeof item === 'string' ? (
            <span key={item} aria-hidden="true" className="px-1 text-ink/40">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={`h-8 min-w-8 rounded-lg border px-2 text-[13px] font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue ${
                item === page
                  ? 'border-blue bg-blue text-white'
                  : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
              }`}
            >
              {formatCount(item)}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          className={pageButton}
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </nav>

      <div className="flex items-center gap-2 text-ink/60">
        Show
        <SelectMenu
          label="Templates per page"
          value={String(pageSize)}
          options={pageSizeOptions}
          onChange={onPageSize}
          compact
          placement="top"
          align="left"
          className="w-[4.25rem]"
          menuClassName="w-20"
        />
        per page
      </div>
    </div>
  )
}

export function TemplatesPage() {
  useDocumentTitle('Templates')
  const reduceMotion = useReducedMotion()
  const notify = useNotify()
  const navigate = useNavigate()
  const location = useLocation()
  const pickingCampaign = location.state?.pickFor === 'campaign'
  const pickingSurvey = location.state?.pickFor === 'survey'
  const picking = pickingCampaign || pickingSurvey
  const campaignType = location.state?.campaignType
  const preview = useDisclosure()
  const filtersOpen = useDisclosure()
  const [selectedId, setSelectedId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [actionError, setActionError] = useState('')
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(() =>
    pickingSurvey
      ? { ...emptyTemplateFilters, type: 'survey', status: 'active' }
      : emptyTemplateFilters,
  )
  const [source, setSource] = useState('admin')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const clientTemplates = source === 'client'

  useEffect(() => {
    if (!pickingSurvey) return
    setFilters((current) =>
      current.type === 'survey' && current.status === 'active'
        ? current
        : { ...current, type: 'survey', status: 'active' },
    )
    setPage(1)
  }, [pickingSurvey])
  const [deleteTemplate, deleteState] = useDeleteTemplateMutation()
  const [setTemplateStatus, statusState] = useSetTemplateStatusMutation()
  const actionBusy = deleteState.isLoading || statusState.isLoading

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(query.trim()), 250)
    return () => window.clearTimeout(handle)
  }, [query])

  const listArgs = useMemo(
    () =>
      templatesQueryParams(
        {
          ...filters,
          scope: clientTemplates ? '' : 'global',
          owner: clientTemplates ? 'mine' : '',
        },
        { page, perPage: pageSize, search: debouncedSearch },
      ),
    [filters, clientTemplates, page, pageSize, debouncedSearch],
  )
  const list = useGetTemplatesQuery(listArgs)
  const templates = list.data?.rows ?? []
  const total = list.data?.total ?? 0
  const lastPage = list.data?.lastPage ?? 1
  const selected = templates.find((template) => template.id === selectedId) ?? null
  const filterCount = activeTemplateFilterCount(filters)
  const chips = templateFilterChips(filters).filter((chip) => chip.group !== 'scope' && chip.group !== 'owner')
  const narrowed = filterCount > 0 || Boolean(debouncedSearch)

  function resetPage() {
    setPage(1)
  }

  function openPreview(id) {
    setSelectedId(id)
    preview.open()
  }

  function canUseTemplate(template) {
    if (String(template.status ?? '').toLowerCase() !== 'active') return false
    if (pickingSurvey) return template.type === 'survey'
    if (pickingCampaign) {
      const mappedType = campaignTypeFromTemplate(template.type)
      if (!mappedType) return false
      if (campaignType && mappedType !== campaignType) return false
      return true
    }
    return template.type === 'survey' || Boolean(campaignTypeFromTemplate(template.type))
  }

  function useTemplate(template) {
    if (template.type === 'survey') {
      if (pickingCampaign) {
        notify.error('Survey templates cannot be used in a campaign.')
        return
      }
      navigate(paths.newSurvey, { state: { template } })
      return
    }

    const mappedType = campaignTypeFromTemplate(template.type)
    if (pickingSurvey) {
      notify.error('Only survey templates can be used here.')
      return
    }
    if (pickingCampaign && campaignType && mappedType && mappedType !== campaignType) {
      notify.error(`This template is for ${mappedType} campaigns.`)
      return
    }
    if (!mappedType) {
      notify.error('Only occasion and promotion templates can be used in a campaign.')
      return
    }
    navigate(paths.newCampaign, {
      state: {
        template: {
          ...template,
          type: mappedType,
          occasionType: template.occasionType,
        },
        campaignType: campaignType || mappedType,
      },
    })
  }

  function clearAll() {
    setQuery('')
    setDebouncedSearch('')
    setFilters(
      pickingSurvey
        ? { ...emptyTemplateFilters, type: 'survey', status: 'active' }
        : emptyTemplateFilters,
    )
    resetPage()
  }

  function askStatusChange(template, status) {
    if (!template?.canEdit || actionBusy) return
    setActionError('')
    setPendingStatus({ template, status })
  }

  async function confirmStatusChange() {
    if (!pendingStatus || statusState.isLoading) return
    setActionError('')
    try {
      const result = await setTemplateStatus({
        id: pendingStatus.template.id,
        status: pendingStatus.status,
      }).unwrap()
      notify.success(
        result.message ||
          (pendingStatus.status === 'active' ? 'Template activated.' : 'Template deactivated.'),
      )
      setPendingStatus(null)
    } catch (error) {
      setActionError(apiErrorMessage(error) || 'Status update failed.')
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deleteState.isLoading) return
    setActionError('')
    try {
      const result = await deleteTemplate(pendingDelete.id).unwrap()
      notify.success(result.message || 'Template deleted.')
      if (selectedId === pendingDelete.id) {
        setSelectedId(null)
        preview.close()
      }
      setPendingDelete(null)
    } catch (error) {
      setActionError(apiErrorMessage(error) || 'Delete failed.')
    }
  }

  return (
    <div className="w-full">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">Templates</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
            {pickingSurvey
              ? 'Preview a survey template, then use it to start your survey. You can edit questions and the invitation before saving.'
              : pickingCampaign
                ? 'Preview a message, then use it in the campaign you started. You can edit it before it sends.'
                : 'Browse system templates or create your own for campaigns, surveys, and SMS.'}
          </p>
          {picking ? (
            <Link
              to={pickingSurvey ? paths.newSurvey : paths.newCampaign}
              className={`mt-3 inline-flex text-sm font-semibold text-blue hover:text-blue/80 ${focusClass}`}
            >
              {pickingSurvey ? 'Back to create survey' : 'Back to create campaign'}
            </Link>
          ) : null}
        </div>
        {!picking ? (
          <Link
            to={paths.newTemplate}
            className={`inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl bg-green px-3.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] ${focusClass}`}
          >
            <Plus size={16} strokeWidth={2.3} aria-hidden="true" />
            Add template
          </Link>
        ) : null}
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search templates</span>
          <Search
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
            placeholder="Search by name, message, or category"
            className="h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
        </label>
        <button
          type="button"
          onClick={filtersOpen.open}
          aria-haspopup="dialog"
          aria-expanded={filtersOpen.isOpen}
          className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-colors ${focusClass} ${
            filterCount
              ? 'border-blue bg-blue/[0.06] text-navy'
              : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
          }`}
        >
          <SlidersHorizontal size={15} strokeWidth={2.2} aria-hidden="true" />
          Filters
          {filterCount ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1.5 text-[11px] font-bold text-white tabular-nums">
              {filterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
          {formatCount(total)} {total === 1 ? 'template' : 'templates'}
          {list.isFetching ? ' · Updating…' : ''}
        </p>
        {chips.length ? (
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  disabled={pickingSurvey && (chip.group === 'type' || chip.group === 'status')}
                  onClick={() => {
                    if (pickingSurvey && (chip.group === 'type' || chip.group === 'status')) return
                    setFilters((current) => ({ ...current, [chip.group]: '' }))
                    resetPage()
                  }}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-blue/20 bg-blue/[0.06] px-3 text-[13px] font-medium text-navy transition-colors hover:border-blue/40 disabled:cursor-default disabled:opacity-70 ${focusClass}`}
                >
                  {chip.label}
                  {pickingSurvey && (chip.group === 'type' || chip.group === 'status') ? null : (
                    <X size={14} strokeWidth={2.2} aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {pickingSurvey && (chip.group === 'type' || chip.group === 'status')
                      ? `${chip.label} filter locked while picking a survey template`
                      : `Remove ${chip.label} filter`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {narrowed ? (
          <button
            type="button"
            onClick={clearAll}
            className={`inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-blue hover:text-blue/80 ${focusClass}`}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear all
          </button>
        ) : null}
      </div>

      <TemplateSourceTabs
        value={source}
        onChange={(next) => {
          setSource(next)
          resetPage()
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={source}
          role="tabpanel"
          id="template-panel"
          aria-labelledby={`template-tab-${source}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
      {list.isLoading ? (
        <div role="status" className="mt-4 grid gap-3 sm:grid-cols-2">
          <span className="sr-only">Loading templates</span>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="skeleton block h-44 rounded-xl" />
          ))}
        </div>
      ) : list.isError ? (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-[#9F1C26]">Templates could not be loaded.</p>
          <button
            type="button"
            onClick={list.refetch}
            className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
          >
            Try again
          </button>
        </div>
      ) : templates.length ? (
        <>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <li key={template.id}>
                <article className="flex h-full flex-col rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)]">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[15px] font-bold text-navy">{template.name}</h2>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <TypeBadge type={displayTypeForBadge(template.type)} />
                      <StatusBadge status={template.status} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-ink/55">
                    {template.description || template.category || '—'}
                  </p>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-ink/75">{template.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openPreview(template.id)}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
                    >
                      <Eye size={15} strokeWidth={2.2} aria-hidden="true" />
                      Preview
                    </button>
                    {canUseTemplate(template) ? (
                      <button
                        type="button"
                        onClick={() => useTemplate(template)}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`}
                      >
                        <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                        Use
                      </button>
                    ) : null}
                    {clientTemplates && template.canEdit ? (
                      <>
                        <Link
                          to={paths.editTemplate(template.id)}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
                        >
                          <Pencil size={15} strokeWidth={2.2} aria-hidden="true" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() =>
                            askStatusChange(
                              template,
                              template.status === 'active' ? 'inactive' : 'active',
                            )
                          }
                          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas disabled:opacity-60 ${focusClass}`}
                        >
                          {template.status === 'active' ? (
                            <>
                              <PauseCircle size={15} strokeWidth={2.2} aria-hidden="true" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <PlayCircle size={15} strokeWidth={2.2} aria-hidden="true" />
                              Activate
                            </>
                          )}
                        </button>
                      </>
                    ) : null}
                    {clientTemplates && template.canDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError('')
                          setPendingDelete(template)
                        }}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#C21F2D]/25 bg-white px-3 text-sm font-semibold text-[#C21F2D] transition-colors hover:bg-[#FDECEE] ${focusClass}`}
                      >
                        <Trash2 size={15} strokeWidth={2.2} aria-hidden="true" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            lastPage={lastPage}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSize={(value) => {
              setPageSize(Number(value))
              resetPage()
            }}
          />
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
            <p className="text-sm font-semibold text-navy">
            {narrowed ? 'No templates match' : clientTemplates ? 'No templates yet' : 'No admin templates'}
          </p>
          <p className="mt-1 text-sm text-ink/55">
            {debouncedSearch && filterCount
              ? `Nothing matches “${debouncedSearch}” with these filters.`
              : debouncedSearch
                ? `Nothing matches “${debouncedSearch}”.`
                : filterCount
                  ? 'Nothing matches these filters.'
                  : clientTemplates
                    ? 'Create your first template to reuse across campaigns and SMS.'
                    : 'Templates published by Cellogent will show up here. You can use them, not edit them.'}
          </p>
          {narrowed ? (
            <button
              type="button"
              onClick={clearAll}
              className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
            >
              <X size={15} strokeWidth={2.2} aria-hidden="true" />
              Clear search and filters
            </button>
          ) : clientTemplates ? (
            <Link
              to={paths.newTemplate}
              className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
            >
              <Plus size={15} strokeWidth={2.3} aria-hidden="true" />
              Add template
            </Link>
          ) : null}
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      {filtersOpen.isOpen ? (
        <TemplateFilterDrawer
          filters={filters}
          onApply={(next) => {
            const { scope: _scope, owner: _owner, ...rest } = next
            setFilters(
              pickingSurvey
                ? { ...rest, type: 'survey', status: rest.status || 'active' }
                : rest,
            )
            resetPage()
          }}
          onClose={filtersOpen.close}
        />
      ) : null}

      {preview.isOpen && selected ? (
        <TemplatePreview
          template={selected}
          onUse={canUseTemplate(selected) ? useTemplate : undefined}
          useHint={
            selected.type === 'survey'
              ? 'You can change the name, questions, and invitation before saving.'
              : undefined
          }
          onEdit={
            picking || !clientTemplates || !selected.canEdit
              ? undefined
              : () => navigate(paths.editTemplate(selected.id))
          }
          onToggleStatus={
            picking || !clientTemplates || !selected.canEdit
              ? undefined
              : () => askStatusChange(selected, selected.status === 'active' ? 'inactive' : 'active')
          }
          onDelete={
            picking || !clientTemplates || !selected.canDelete
              ? undefined
              : () => {
                  setActionError('')
                  setPendingDelete(selected)
                }
          }
          onClose={preview.close}
        />
      ) : null}

      {pendingStatus ? (
        <ConfirmDialog
          title={
            pendingStatus.status === 'active' ? 'Activate template?' : 'Deactivate template?'
          }
          description={
            pendingStatus.status === 'active' ? (
              <>
                Make{' '}
                <span className="font-semibold text-navy">{pendingStatus.template.name}</span>{' '}
                available to use again.
              </>
            ) : (
              <>
                Mark{' '}
                <span className="font-semibold text-navy">{pendingStatus.template.name}</span> as
                inactive. It stays in your library but won’t be used for new sends.
              </>
            )
          }
          confirmLabel={pendingStatus.status === 'active' ? 'Activate' : 'Deactivate'}
          busyLabel={pendingStatus.status === 'active' ? 'Activating…' : 'Deactivating…'}
          tone={pendingStatus.status === 'active' ? 'restore' : 'warning'}
          busy={statusState.isLoading}
          error={actionError}
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
          title="Delete template?"
          description={
            <>
              This permanently removes{' '}
              <span className="font-semibold text-navy">{pendingDelete.name}</span>.
            </>
          }
          confirmLabel="Delete template"
          busyLabel="Deleting…"
          tone="danger"
          busy={deleteState.isLoading}
          error={actionError}
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
