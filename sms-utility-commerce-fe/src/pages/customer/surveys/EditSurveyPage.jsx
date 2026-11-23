import { Link, useParams } from 'react-router'
import { paths } from '../../../routes/paths'
import { useGetSurveyQuery, useGetSurveyQuestionsQuery } from '../../../services/api/surveys/surveysApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { canEditSurvey } from './actions'
import { NewSurveyPage } from './NewSurveyPage'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function EditSurveyPage() {
  const { surveyId } = useParams()
  const detail = useGetSurveyQuery(surveyId, { skip: !surveyId })
  const questions = useGetSurveyQuestionsQuery(surveyId, { skip: !surveyId })
  const survey = detail.data ?? null
  const loading = detail.isLoading || questions.isLoading

  const locked = Boolean(survey) && !canEditSurvey(survey.status)
  useDocumentTitle(locked ? survey.name : survey?.name ? `Edit ${survey.name}` : 'Edit survey')

  if (loading) {
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

  if (!survey || !Array.isArray(questions.data)) {
    return (
      <div className="rounded-2xl border border-[#D8E7FA] bg-white px-5 py-8">
        <p className="text-sm font-semibold text-navy">Survey not found</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">That survey is not in this workspace.</p>
        <Link to={paths.surveys} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          Back to surveys
        </Link>
      </div>
    )
  }

  if (locked) {
    return (
      <div className="rounded-2xl border border-[#D8E7FA] bg-white px-5 py-8">
        <p className="text-sm font-semibold text-navy">This survey can no longer be edited</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
          {survey.name} is {String(survey.status).toLowerCase()}. Changes are only available while a survey is still a draft.
        </p>
        <Link to={paths.survey(survey.id)} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          View survey
        </Link>
      </div>
    )
  }

  return (
    <NewSurveyPage
      key={`${survey.id}-${survey.updatedAt}-${questions.data.map((question) => question.serverId).join('.')}`}
      survey={{ ...survey, questions: questions.data }}
    />
  )
}
