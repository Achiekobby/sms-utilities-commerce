import { Check, ChevronLeft, ChevronRight, Eye, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { SelectMenu } from '../../../components/SelectMenu'
import { TypeBadge } from '../../../components/TypeBadge'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { usePagination } from '../../../utils/hooks/usePagination'
import { formatCount } from '../dashboard/format'
import { messageTemplates } from './data'
import { activeTemplateFilterCount, emptyTemplateFilters, queryTemplates } from './query'
import { TemplateFilterDrawer, templateFilterChips } from './sections/TemplateFilterDrawer'
import { TemplatePreview } from './sections/TemplatePreview'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const pageButton =
  'flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-40'
const pageSizeOptions = [6, 12, 24].map((size) => ({ id: String(size), label: String(size) }))

function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

function Pagination({ pager, total, pageSize, onPageSize }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] sm:justify-between">
      <p className="text-ink/60 tabular-nums">
        Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(total)} templates
      </p>

      <nav aria-label="Template pages" className="flex items-center gap-1.5">
        <button type="button" aria-label="Previous page" disabled={pager.page === 1} onClick={pager.previous} className={pageButton}>
          <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>

        {pageList(pager.page, pager.pageCount).map((item) =>
          typeof item === 'string' ? (
            <span key={item} aria-hidden="true" className="px-1 text-ink/40">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === pager.page ? 'page' : undefined}
              onClick={() => pager.setPage(item)}
              className={`h-8 min-w-8 rounded-lg border px-2 text-[13px] font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue ${
                item === pager.page
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
          disabled={pager.page === pager.pageCount}
          onClick={pager.next}
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
  const navigate = useNavigate()
  const location = useLocation()
  const picking = location.state?.pickFor === 'campaign'
  const preview = useDisclosure()
  const filtersOpen = useDisclosure()
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyTemplateFilters)
  const [pageSize, setPageSize] = useState(6)
  const selected = messageTemplates.find((template) => template.id === selectedId) ?? null
  const filterCount = activeTemplateFilterCount(filters)
  const search = query.trim()
  const results = useMemo(
    () => queryTemplates(messageTemplates, { search, ...filters }),
    [search, filters],
  )
  const pager = usePagination({ total: results.length, pageSize })
  const page = results.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)
  const chips = templateFilterChips(filters)

  function resetPage() {
    pager.setPage(1)
  }

  function openPreview(id) {
    setSelectedId(id)
    preview.open()
  }

  function useTemplate(template) {
    navigate(paths.newCampaign, { state: { template } })
  }

  function removeFilter(group, id) {
    setFilters((current) => ({ ...current, [group]: current[group].filter((item) => item !== id) }))
    resetPage()
  }

  function clearAll() {
    setQuery('')
    setFilters(emptyTemplateFilters)
    resetPage()
  }

  return (
    <div className="w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">Templates</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          {picking
            ? 'Preview a message, then use it in the campaign you started. You can edit it before it sends.'
            : 'Saved messages you can preview and drop into a campaign.'}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search templates by name, message, or sender</span>
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
            placeholder="Search by name, message, or sender"
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
          {formatCount(results.length)} {results.length === 1 ? 'template' : 'templates'}
        </p>
        {chips.length ? (
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={() => removeFilter(chip.group, chip.id)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-blue/20 bg-blue/[0.06] px-3 text-[13px] font-medium text-navy transition-colors hover:border-blue/40 ${focusClass}`}
                >
                  {chip.label}
                  <X size={14} strokeWidth={2.2} aria-hidden="true" />
                  <span className="sr-only">Remove {chip.label} filter</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {filterCount || query ? (
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

      {results.length ? (
        <>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {page.map((template) => (
            <li key={template.id}>
              <article className="flex h-full flex-col rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)]">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[15px] font-bold text-navy">{template.name}</h2>
                  <TypeBadge type={template.type} />
                </div>
                <p className="mt-1 text-xs leading-5 text-ink/55">{template.description}</p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-ink/75">{template.body}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPreview(template.id)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
                  >
                    <Eye size={15} strokeWidth={2.2} aria-hidden="true" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => useTemplate(template)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`}
                  >
                    <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                    Use
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <Pagination
          pager={pager}
          total={results.length}
          pageSize={pageSize}
          onPageSize={(value) => {
            setPageSize(Number(value))
            resetPage()
          }}
        />
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-navy">No templates match</p>
          <p className="mt-1 text-sm text-ink/55">
            {search && filterCount
              ? `Nothing matches “${search}” with these filters.`
              : search
                ? `Nothing matches “${search}”. Try a name, message, or sender.`
                : 'Nothing matches these filters.'}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
          >
            <X size={15} strokeWidth={2.2} aria-hidden="true" />
            Clear search and filters
          </button>
        </div>
      )}

      {filtersOpen.isOpen ? (
        <TemplateFilterDrawer
          templates={messageTemplates}
          search={search}
          filters={filters}
          onApply={(next) => {
            setFilters(next)
            resetPage()
          }}
          onClose={filtersOpen.close}
        />
      ) : null}

      {preview.isOpen && selected ? (
        <TemplatePreview template={selected} onUse={useTemplate} onClose={preview.close} />
      ) : null}
    </div>
  )
}
