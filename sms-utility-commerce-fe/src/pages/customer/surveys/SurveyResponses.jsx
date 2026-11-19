import { MessageSquareText } from 'lucide-react'
import { useState } from 'react'
import { formatStamp } from '../../../features/contacts/contactImport'
import { useApiErrorToast } from '../../../features/notifications/useApiErrorToast'
import { useGetSurveyResponsesQuery } from '../../../services/api/surveys/surveysApi'
import emptyIllustration from '../../../assets/images/empty_illustrator.png'
import { PageBar } from '../contacts/sections/PageBar'
import { formatCount } from '../dashboard/format'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-2xl border border-[#E6EEF8] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.04),0_16px_32px_-22px_rgba(11,31,91,0.4)] sm:p-6'
const RESPONSES_PAGE = 10

function answerPreview(answers) {
  if (answers == null) return '—'
  if (Array.isArray(answers)) {
    if (!answers.length) return '—'
    return answers
      .map((item) => {
        if (item == null) return ''
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        if (typeof item === 'object') {
          const value = item.answer ?? item.value ?? item.response
          if (value != null) return Array.isArray(value) ? value.join(', ') : String(value)
        }
        return ''
      })
      .filter(Boolean)
      .join(' · ') || `${formatCount(answers.length)} answers`
  }
  if (typeof answers === 'object') {
    const values = Object.values(answers)
      .map((value) => (Array.isArray(value) ? value.join(', ') : String(value ?? '')))
      .filter(Boolean)
    return values.join(' · ') || `${formatCount(Object.keys(answers).length)} answers`
  }
  return String(answers)
}

function ResponsesEmpty() {
  return (
    <div className="relative px-2 py-8 text-center sm:py-12">
      <img src={emptyIllustration} alt="" className="mx-auto h-auto w-full max-w-[15.5rem]" />
      <h3 className="mt-6 text-xl font-bold tracking-tight text-navy">No responses yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">
        Responses will appear here once people complete this survey.
      </p>
    </div>
  )
}

export function SurveyResponses({ surveyId }) {
  const [page, setPage] = useState(1)
  const list = useGetSurveyResponsesQuery(
    { id: surveyId, page, perPage: RESPONSES_PAGE },
    { skip: !surveyId },
  )
  useApiErrorToast(list.error, list.isError && !list.isFetching)
  const rows = list.data?.rows ?? []
  const empty = !list.isLoading && !list.isError && rows.length === 0

  return (
    <section
      className={`${card} ${empty ? 'overflow-hidden bg-[radial-gradient(ellipse_at_85%_0%,rgba(214,226,255,0.55),transparent_42%),radial-gradient(ellipse_at_0%_100%,rgba(214,232,255,0.7),transparent_46%)]' : ''}`}
      aria-labelledby="survey-responses"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="survey-responses" className="text-base font-bold text-navy">
            Responses
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink/60">Each row is one completed survey response.</p>
        </div>
        {list.data?.total ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy tabular-nums">
            <MessageSquareText size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
            {formatCount(list.data.total)}
          </p>
        ) : null}
      </div>

      {list.isLoading ? (
        <div role="status" className="mt-4 space-y-2">
          <span className="sr-only">Loading responses</span>
          <span className="skeleton block h-12 rounded-xl" />
          <span className="skeleton block h-12 rounded-xl" />
        </div>
      ) : list.isError ? (
        <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#9F1C26]">Responses could not be loaded.</p>
          <button type="button" onClick={list.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : rows.length ? (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-medium text-ink/50">
                  {['When', 'Phone', 'Contact', 'Answers'].map((label) => (
                    <th key={label} scope="col" className="border-b border-ink/10 px-3 py-2 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="border-b border-ink/[0.06] px-3 py-3 whitespace-nowrap text-ink/70">
                      {formatStamp(row.completedAt || row.createdAt) || '—'}
                    </td>
                    <td className="border-b border-ink/[0.06] px-3 py-3 font-mono text-[13px] text-navy">{row.phone || '—'}</td>
                    <td className="border-b border-ink/[0.06] px-3 py-3 tabular-nums text-ink/70">{row.contactId || '—'}</td>
                    <td className="border-b border-ink/[0.06] max-w-sm truncate px-3 py-3 text-ink/70">{answerPreview(row.answers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PageBar
            page={list.data?.page ?? page}
            lastPage={list.data?.lastPage ?? 1}
            total={list.data?.total ?? 0}
            perPage={list.data?.perPage ?? RESPONSES_PAGE}
            onPage={setPage}
            label="Survey response pages"
          />
        </>
      ) : (
        <ResponsesEmpty />
      )}
    </section>
  )
}
