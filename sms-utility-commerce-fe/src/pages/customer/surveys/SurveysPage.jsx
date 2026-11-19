import { Archive, ClipboardList, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { formatStamp } from '../../../features/contacts/contactImport'
import {
  SURVEY_PAGE_SIZE,
  useGetSurveysQuery,
  useGetTrashedSurveysQuery,
} from '../../../services/api/surveys/surveysApi'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { PageBar } from '../contacts/sections/PageBar'
import { formatCount } from '../dashboard/format'
import { SurveyActions } from './SurveyActions'
import { SurveyStatus } from './SurveyStatus'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const control =
  'h-10 rounded-lg border border-ink/15 bg-white px-3 text-sm text-navy outline-none transition-colors hover:border-blue/35 focus:border-blue'
const head =
  'border-b border-[#E1EAF6] bg-[#F3F7FD] px-4 py-3 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase'
const cell = 'border-b border-[#E7EEF8] px-4 py-3.5 align-middle text-sm text-ink/75'

const pageSizes = [3, 6, 12]

function SurveyViewTabs({ archived, archivedCount, onChange }) {
  function tabClass(selected) {
    return `rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${focusClass} ${
      selected ? 'bg-white text-navy shadow-[0_1px_2px_rgba(16,33,61,0.08)]' : 'text-ink/60 hover:text-navy'
    }`
  }

  return (
    <div role="tablist" aria-label="Survey lists" className="mt-5 inline-flex rounded-lg bg-ink/[0.05] p-1">
      <button
        type="button"
        role="tab"
        id="surveys-tab-active"
        aria-selected={!archived}
        aria-controls="surveys-panel"
        onClick={() => onChange('active')}
        className={tabClass(!archived)}
      >
        Active
      </button>
      <button
        type="button"
        role="tab"
        id="surveys-tab-archived"
        aria-selected={archived}
        aria-controls="surveys-panel"
        onClick={() => onChange('archived')}
        className={tabClass(archived)}
      >
        Archived
        {archivedCount > 0 ? (
          <span className={`ml-1.5 rounded-full px-1.5 text-xs tabular-nums ${archived ? 'bg-navy/10' : 'bg-white'}`}>
            {formatCount(archivedCount)}
          </span>
        ) : null}
      </button>
    </div>
  )
}

export function SurveysPage() {
  useDocumentTitle('Surveys')
  const [params, setParams] = useSearchParams()
  const archived = params.get('view') === 'archived'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(SURVEY_PAGE_SIZE)
  const active = useGetSurveysQuery({ page: archived ? 1 : page, perPage: pageSize }, { skip: archived })
  const trashed = useGetTrashedSurveysQuery({ page: archived ? page : 1, perPage: pageSize })
  const list = archived ? trashed : active
  const rows = list.data?.rows ?? []
  const total = list.data?.total ?? 0
  const lastPage = Math.max(1, list.data?.lastPage ?? 1)
  const currentPage = Math.min(page, lastPage)
  const archivedCount = trashed.data?.total ?? 0
  const saved = useLocation().state?.saved

  function show(view) {
    setPage(1)
    setParams(view === 'archived' ? { view: 'archived' } : {}, { replace: true })
  }

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Surveys</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            {archived
              ? 'Archived surveys wait here until you restore or remove them forever.'
              : 'Surveys on your account, loaded a page at a time.'}
          </p>
        </div>
        {archived ? null : (
          <Link
            to={paths.newSurvey}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] ${focusClass}`}
          >
            <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
            Create survey
          </Link>
        )}
      </header>

      <SurveyViewTabs archived={archived} archivedCount={archivedCount} onChange={show} />

      {saved ? (
        <p role="status" className="mt-4 rounded-xl border border-green/20 bg-[#E8F8EF] px-4 py-3 text-sm font-medium text-navy">
          {saved}
        </p>
      ) : null}

      <section
        role="tabpanel"
        id="surveys-panel"
        aria-labelledby={archived ? 'surveys-tab-archived' : 'surveys-tab-active'}
        aria-label={archived ? 'Archived surveys' : 'Active surveys'}
        className="mt-4 overflow-hidden rounded-2xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.05)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#E7EEF8] px-4 py-3">
          <p className="text-[13px] text-ink/55 tabular-nums">
            {formatCount(total)} {total === 1 ? 'survey' : 'surveys'}
          </p>
        </div>

        {list.isLoading ? (
          <div role="status" className="space-y-2 px-4 py-4">
            <span className="sr-only">Loading surveys</span>
            {Array.from({ length: pageSize }, (_, index) => (
              <span key={index} className="skeleton block h-12 rounded-lg" />
            ))}
          </div>
        ) : list.isError ? (
          <div role="alert" className="m-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#9F1C26]">
              {archived ? 'Archived surveys could not be loaded.' : 'Surveys could not be loaded.'}
            </p>
            <button type="button" onClick={list.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            {archived ? (
              <Archive className="mx-auto text-ink/30" size={28} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <ClipboardList className="mx-auto text-ink/30" size={28} strokeWidth={1.8} aria-hidden="true" />
            )}
            <p className="mt-3 text-sm font-semibold text-navy">{archived ? 'No archived surveys' : 'No surveys yet'}</p>
            <p className="mt-1 text-sm text-ink/55">
              {archived
                ? 'When you archive a survey, it waits here until you restore or remove it.'
                : 'Surveys you create will show up in this list.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th scope="col" className={head}>Survey</th>
                  <th scope="col" className={head}>Questions</th>
                  <th scope="col" className={head}>Status</th>
                  <th scope="col" className={head}>
                    {archived ? 'Archived' : 'Updated'}
                  </th>
                  <th scope="col" className={`${head} text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((survey) => (
                  <tr key={survey.id} className="transition-colors hover:bg-[#F7FAFD]">
                    <th scope="row" className={`${cell} max-w-[18rem] text-left font-semibold text-navy`}>
                      <span className="block truncate" title={survey.name}>
                        {survey.name}
                      </span>
                      {survey.description ? (
                        <span className="mt-0.5 block truncate text-[12px] font-medium text-ink/45" title={survey.description}>
                          {survey.description}
                        </span>
                      ) : (
                        <span className="mt-0.5 block text-[12px] font-medium text-ink/40">ID {survey.id}</span>
                      )}
                    </th>
                    <td className={`${cell} tabular-nums`}>
                      {survey.questionCount == null ? '—' : formatCount(survey.questionCount)}
                    </td>
                    <td className={cell}>
                      <SurveyStatus status={survey.status} />
                    </td>
                    <td className={cell}>
                      {formatStamp(archived ? survey.deletedAt || survey.updatedAt : survey.updatedAt || survey.createdAt) || '—'}
                    </td>
                    <td className={`${cell} text-right`}>
                      <SurveyActions survey={survey} archived={archived} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[#E7EEF8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-[13px] text-ink/60">
            Rows
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(1)
              }}
              className={`${control} w-[4.5rem] ${focusClass}`}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <PageBar
            page={currentPage}
            lastPage={lastPage}
            total={Math.max(total, rows.length)}
            perPage={pageSize}
            onPage={setPage}
            label={archived ? 'Archived survey pages' : 'Survey pages'}
            className="mt-0"
            always={total > 0}
          />
        </div>
      </section>
    </div>
  )
}
