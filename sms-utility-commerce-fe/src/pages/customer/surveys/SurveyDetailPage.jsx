import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { paths } from '../../../routes/paths'
import { useGetSurveyQuery, useGetSurveyQuestionsQuery } from '../../../services/api/surveys/surveysApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { questionTypeMeta } from './model'
import { SurveyPhone } from './SurveyPhone'
import { SurveyStatus } from './SurveyStatus'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SurveyDetailPage() {
  const { surveyId } = useParams()
  const detail = useGetSurveyQuery(surveyId, { skip: !surveyId })
  const questions = useGetSurveyQuestionsQuery(surveyId, { skip: !surveyId })
  const survey = detail.data ?? null
  const questionList = questions.data ?? survey?.questions ?? []

  useDocumentTitle(survey?.name ? survey.name : 'Survey')

  if (detail.isLoading || questions.isLoading) {
    return (
      <div role="status" className="space-y-3">
        <span className="sr-only">Loading survey</span>
        <span className="skeleton block h-8 w-48 rounded-lg" />
        <span className="skeleton block h-64 rounded-xl" />
      </div>
    )
  }

  if ((detail.isError && detail.error?.status !== 404) || questions.isError) {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#9F1C26]">This survey could not be loaded.</p>
        <button
          type="button"
          onClick={() => {
            detail.refetch()
            questions.refetch()
          }}
          className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
        >
          Try again
        </button>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="rounded-2xl border border-[#D8E7FA] bg-white px-5 py-8">
        <p className="text-sm font-semibold text-navy">Survey not found</p>
        <Link to={paths.surveys} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          Back to surveys
        </Link>
      </div>
    )
  }

  const draft = { ...survey, questions: questionList }

  return (
    <div className="w-full">
      <Link
        to={paths.surveys}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 text-[13px] font-semibold text-navy hover:bg-canvas ${focusClass}`}
      >
        <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
        Surveys
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-navy">{survey.name}</h1>
            <SurveyStatus status={survey.status} />
          </div>
          {survey.intro ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">{survey.intro}</p> : null}
        </div>
        <Link
          to={paths.editSurvey(survey.id)}
          className={`inline-flex h-9 items-center gap-1.5 rounded-xl bg-green px-3 text-[13px] font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
        >
          <Pencil size={15} strokeWidth={2.2} aria-hidden="true" />
          Edit survey
        </Link>
      </header>

      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-2xl border border-[#E6EEF8] bg-white p-5 sm:p-6">
          <h2 className="text-base font-bold text-navy">Survey details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Fact label="Sender" value={survey.sender || '—'} />
            <Fact label="Send time" value={survey.sendAt || 'Not scheduled'} />
            <Fact label="Questions" value={formatCount(questionList.length)} />
            <Fact label="Groups" value={formatCount(survey.groupIds?.length ?? 0)} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#F7FAFD] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-wide text-ink/45 uppercase">Message</p>
            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-navy">{survey.body || 'No message'}</p>
          </div>
          {survey.surveyUrl ? (
            <a
              href={survey.surveyUrl}
              target="_blank"
              rel="noreferrer"
              className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}
            >
              Open survey link
              <ExternalLink size={14} strokeWidth={2.2} aria-hidden="true" />
            </a>
          ) : null}
          <ol className="mt-5 flex flex-col gap-2">
            {questionList.map((question, index) => (
              <li key={question.id} className="flex items-start gap-3 rounded-xl border border-[#EEF3FA] px-3 py-2.5">
                <span className="mt-0.5 text-xs font-bold text-blue tabular-nums">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-navy">{question.prompt}</span>
                  <span className="text-xs text-ink/50">
                    {questionTypeMeta(question.type).label}
                    {question.required ? ' · required' : ''}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        <aside className="rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#E7F6EE,transparent_55%),linear-gradient(180deg,#F4F8FD,#E8F0FA)] px-4 py-5">
          <SurveyPhone draft={draft} />
        </aside>
      </div>
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-navy">{value}</dd>
    </div>
  )
}
