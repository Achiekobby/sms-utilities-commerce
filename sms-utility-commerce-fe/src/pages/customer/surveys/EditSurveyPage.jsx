import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { apiErrorMessage, fieldErrors } from '../../../features/auth/client'
import { paths } from '../../../routes/paths'
import { useGetSurveysQuery, useUpdateSurveyQuestionsMutation } from '../../../services/api/surveys/surveysApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { QuestionList } from './QuestionList'
import { SurveyPhone } from './SurveyPhone'
import { questionsPayload, validateQuestions } from './model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/20 ${focusClass}`

function sameSurvey(survey, surveyId) {
  return survey && String(survey.id) === String(surveyId)
}

export function EditSurveyPage() {
  const { surveyId } = useParams()
  const carried = useLocation().state?.survey
  const list = useGetSurveysQuery({ page: 1, perPage: 50 })
  const fromList = list.data?.rows?.find((survey) => sameSurvey(survey, surveyId)) ?? null
  const survey = [fromList, carried].find((item) => sameSurvey(item, surveyId) && Array.isArray(item.questions))
    ?? [fromList, carried].find((item) => sameSurvey(item, surveyId))
    ?? null

  useDocumentTitle(survey?.name ? `Edit ${survey.name}` : 'Edit survey')

  if (list.isLoading && !survey) {
    return (
      <div role="status" className="space-y-3">
        <span className="sr-only">Loading survey</span>
        <span className="skeleton block h-8 w-48 rounded-lg" />
        <span className="skeleton block h-64 rounded-xl" />
      </div>
    )
  }

  if (!survey && list.isError) {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#9F1C26]">{apiErrorMessage(list.error)}</p>
        <button type="button" onClick={list.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
          Try again
        </button>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="rounded-2xl border border-[#D8E7FA] bg-white px-5 py-8">
        <p className="text-sm font-semibold text-navy">This survey is not in the current list.</p>
        <Link to={paths.surveys} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          Back to surveys
        </Link>
      </div>
    )
  }

  if (!Array.isArray(survey.questions)) {
    return (
      <div className="rounded-2xl border border-[#D8E7FA] bg-white px-5 py-8">
        <p className="text-sm font-semibold text-navy">{survey.name}</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
          The survey list did not include this survey’s questions, so they cannot be opened for editing.
        </p>
        <Link to={paths.surveys} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          Back to surveys
        </Link>
      </div>
    )
  }

  return <QuestionEditor key={survey.id} survey={survey} />
}

function QuestionEditor({ survey }) {
  const navigate = useNavigate()
  const [updateQuestions, updateState] = useUpdateSurveyQuestionsMutation()
  const [questions, setQuestions] = useState(() => survey.questions.map((question) => ({ ...question, options: [...(question.options ?? [])] })))
  const [mirror, setMirror] = useState('welcome')
  const [errors, setErrors] = useState({})

  const draft = {
    name: survey.name,
    intro: survey.description || '',
    body: '',
    sender: '',
    questions,
  }

  function showQuestion(id, list = questions) {
    if (!id) {
      setMirror('welcome')
      return
    }
    const index = list.findIndex((question) => question.id === id)
    setMirror(index < 0 ? 'welcome' : index)
  }

  async function save() {
    const found = validateQuestions(questions)
    if (Object.keys(found).length) {
      setErrors(found)
      const questionId = Object.keys(found.questionsById ?? {})[0]
      window.requestAnimationFrame(() => {
        document.getElementById(questionId ? `survey-question-${questionId}` : 'survey-questions')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
      return
    }
    setErrors({})
    try {
      const result = await updateQuestions({ id: survey.id, ...questionsPayload(questions) }).unwrap()
      navigate(paths.surveys, { state: { saved: result.message || 'Survey questions updated.' } })
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors({ submit: fields.questions || apiErrorMessage(error) })
    }
  }

  return (
    <div className="w-full">
      <header>
        <p className="text-sm font-medium text-ink/55">
          <Link to={paths.surveys} className={`rounded-sm text-blue ${focusClass}`}>
            Surveys
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Edit questions</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          {survey.name}. Existing questions keep their id. New questions are sent without one.
        </p>
      </header>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
          <QuestionList
            questions={questions}
            activeId={typeof mirror === 'number' ? questions[mirror]?.id : null}
            errors={{ form: errors.questions, byId: errors.questionsById }}
            onChange={setQuestions}
            onActive={showQuestion}
          />
          {errors.submit ? (
            <p role="alert" className="mt-4 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-3 py-2 text-sm text-[#9F1C26]">
              {errors.submit}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EEF8] pt-5">
            <Link to={paths.surveys} className={`inline-flex h-11 items-center gap-2 rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}>
              <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
              Surveys
            </Link>
            <button type="button" onClick={save} disabled={updateState.isLoading} className={primary}>
              <Save size={16} strokeWidth={2.3} aria-hidden="true" />
              {updateState.isLoading ? 'Saving…' : 'Save questions'}
            </button>
          </div>
        </section>

        <aside className="xl:sticky xl:top-4">
          <div className="rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#E7F6EE,transparent_55%),linear-gradient(180deg,#F4F8FD,#E8F0FA)] px-4 py-5">
            <SurveyPhone
              draft={draft}
              screen={mirror}
              onScreen={setMirror}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
