import { Check, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { apiErrorMessage } from '../../features/auth/client'
import { useGetPublicSurveyQuery, useSubmitPublicSurveyMutation } from '../../services/api/surveys/surveysApi'
import { useDocumentTitle } from '../../utils/hooks/useDocumentTitle'
import Images from '../../utils/Images'
import { paths } from '../../routes/paths'
import { isAnswered, publicSurveyAnswers, validatePublicSurvey } from './publicSurvey'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const fieldClass =
  'w-full rounded-xl border border-[#D5E0EE] bg-white px-3.5 text-sm text-navy outline-none transition-colors placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/10'

export function PublicSurveyPage() {
  const { surveyId = '' } = useParams()
  const detail = useGetPublicSurveyQuery(surveyId, { skip: !surveyId })
  const [submitSurvey, submitState] = useSubmitPublicSurveyMutation()
  const survey = detail.data ?? null
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(null)

  useDocumentTitle(survey?.name || 'Survey')

  const questions = survey?.questions ?? []
  const answered = questions.filter((question) => isAnswered(question, answers[question.id])).length

  function setAnswer(id, value) {
    setAnswers((current) => ({ ...current, [id]: value }))
    setErrors((current) => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!survey || submitState.isLoading) return
    const found = validatePublicSurvey(survey, answers)
    setErrors(found)
    setSubmitError('')
    if (Object.keys(found).length) {
      const first = survey.questions.find((question) => found[question.id])
      document.getElementById(`public-question-${first?.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    try {
      const result = await submitSurvey({ id: surveyId, answers: publicSurveyAnswers(survey, answers) }).unwrap()
      setDone(result.message)
    } catch (error) {
      setSubmitError(apiErrorMessage(error))
    }
  }

  return (
    <div className="min-h-svh bg-[#F3F6FB] text-navy">
      <header className="border-b border-[#E6EEF8] bg-white">
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to={paths.home} className={`rounded-sm ${focusClass}`}>
            <img src={Images.logo} alt="UtiliSMS" className="h-8 w-auto sm:h-9" />
          </Link>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-ink/45 uppercase">Survey</p>
        </div>
        <div className="relative overflow-hidden bg-[#062047] text-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(11,99,246,0.5),transparent_46%),radial-gradient(ellipse_at_bottom_left,rgba(0,136,89,0.32),transparent_38%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10">
            {detail.isLoading ? (
              <div role="status" className="space-y-3">
                <span className="sr-only">Loading survey</span>
                <span className="block h-4 w-28 rounded-full bg-white/15" />
                <span className="block h-9 w-4/5 max-w-md rounded-xl bg-white/15" />
                <span className="block h-16 max-w-xl rounded-xl bg-white/10" />
              </div>
            ) : survey ? (
              <>
                <p className="text-xs font-semibold tracking-[0.14em] text-white/65 uppercase">We would like your feedback</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{survey.name}</h1>
                {survey.intro ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">{survey.intro}</p> : null}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15">
                    {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                  </span>
                  {survey.acceptingResponses && !done ? (
                    <span
                      className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                      style={{ color: 'var(--color-navy, #062047)' }}
                    >
                      {answered} of {questions.length} answered
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-[0.14em] text-white/65 uppercase">Survey</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">This survey is unavailable</h1>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10">
        {detail.isError ? (
          <StatusCard
            title="We could not open this survey"
            detail={apiErrorMessage(detail.error)}
            action={
              <button
                type="button"
                onClick={detail.refetch}
                className="inline-flex h-10 items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
              >
                Try again
              </button>
            }
          />
        ) : null}

        {!detail.isLoading && !detail.isError && !survey ? (
          <StatusCard
            title="Survey not found"
            detail="This link does not match a survey. Check the address or ask the sender for a new one."
          />
        ) : null}

        {survey && done ? (
          <StatusCard title="Thank you" detail={done} />
        ) : null}

        {survey && !done && !survey.acceptingResponses ? (
          <StatusCard
            title="This survey is closed"
            detail={`${survey.name} is no longer accepting responses.`}
          />
        ) : null}

        {survey && !done && survey.acceptingResponses ? (
          <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-[#E6EEF8] bg-white p-5 shadow-[0_1px_2px_rgba(16,33,61,0.04)] lg:sticky lg:top-6">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">Your progress</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-navy">
                {answered}
                <span className="text-base font-semibold text-ink/40"> / {questions.length}</span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E7EEF8]" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-green transition-[width]"
                  style={{ width: `${questions.length ? (answered / questions.length) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/55">Questions marked with a star are required.</p>
              {survey.reward ? <p className="mt-4 rounded-xl bg-[#F3FBF6] px-3 py-2.5 text-sm leading-6 text-[#067348]">{survey.reward}</p> : null}
            </aside>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                  value={answers[question.id]}
                  error={errors[question.id]}
                  onChange={(value) => setAnswer(question.id, value)}
                />
              ))}

              {submitError ? (
                <p role="alert" className="rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 text-sm text-[#9F1C26]">
                  {submitError}
                </p>
              ) : null}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitState.isLoading || questions.length === 0}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/20"
                >
                  {submitState.isLoading ? 'Submitting…' : 'Submit response'}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  )
}

function StatusCard({ title, detail, action }) {
  return (
    <section className="max-w-xl rounded-2xl border border-[#E6EEF8] bg-white px-5 py-8 shadow-[0_1px_2px_rgba(16,33,61,0.04)]">
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/60">{detail}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  )
}

function QuestionCard({ index, question, value, error, onChange }) {
  const labelId = `public-question-${question.id}-label`
  return (
    <section
      id={`public-question-${question.id}`}
      aria-labelledby={labelId}
      className={`rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04)] sm:p-5 ${
        error ? 'border-[#E0232E]/50' : 'border-[#E6EEF8]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#E7F1FC] text-sm font-bold text-blue tabular-nums">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={labelId} className="text-base font-semibold text-navy">
            {question.prompt}
            {question.required ? (
              <span className="text-[#E0232E]" aria-hidden="true">
                {' '}
                *
              </span>
            ) : (
              <span className="ml-2 text-xs font-medium text-ink/40">Optional</span>
            )}
          </h2>
          <div className="mt-3">
            <QuestionControl question={question} value={value} invalid={Boolean(error)} onChange={onChange} />
          </div>
          {error ? (
            <p role="alert" className="mt-2 text-sm text-[#9F1C26]">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function QuestionControl({ question, value, invalid, onChange }) {
  if (question.type === 'rating') return <RatingControl value={value} invalid={invalid} onChange={onChange} label={question.prompt} />
  if (question.type === 'yes_no') return <YesNoControl value={value} onChange={onChange} label={question.prompt} />
  if (question.type === 'single_choice') return <SingleChoiceControl question={question} value={value} onChange={onChange} />
  if (question.type === 'multiple_choice') return <MultiChoiceControl question={question} value={value} onChange={onChange} />
  if (question.type === 'long_text') {
    return (
      <textarea
        value={value ?? ''}
        rows={4}
        aria-invalid={invalid || undefined}
        placeholder="Write your answer"
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClass} resize-y py-3`}
      />
    )
  }
  return (
    <input
      value={value ?? ''}
      aria-invalid={invalid || undefined}
      inputMode={question.type === 'number' ? 'decimal' : 'text'}
      placeholder={question.type === 'number' ? '0' : 'Type your answer'}
      onChange={(event) => onChange(event.target.value)}
      className={`${fieldClass} h-11`}
    />
  )
}

function RatingControl({ value, invalid, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} aria-invalid={invalid || undefined} className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((score) => {
        const selected = Number(value) === score
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(score)}
            className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-sm font-bold transition-colors ${
              selected ? 'border-green bg-green text-white' : 'border-[#D5E0EE] bg-white text-navy hover:border-green/40'
            }`}
          >
            <Star size={14} strokeWidth={2.2} className={selected ? 'fill-white' : 'text-ink/30'} aria-hidden="true" />
            {score}
          </button>
        )
      })}
    </div>
  )
}

function YesNoControl({ value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2">
      {[
        ['yes', 'Yes'],
        ['no', 'No'],
      ].map(([option, caption]) => {
        const selected = value === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={`h-12 rounded-xl border text-sm font-bold transition-colors ${
              selected ? 'border-[#062047] bg-[#062047] text-white' : 'border-[#D5E0EE] bg-white text-navy hover:border-blue/40'
            }`}
          >
            {caption}
          </button>
        )
      })}
    </div>
  )
}

function SingleChoiceControl({ question, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={question.prompt} className="flex flex-col gap-2">
      {question.options.map((option, index) => {
        const selected = value === option
        return (
          <button
            key={`${option}-${index}`}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
              selected ? 'border-green bg-[#E5F6EC] text-navy' : 'border-[#D5E0EE] bg-white text-navy hover:border-blue/40'
            }`}
          >
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                selected ? 'border-green bg-green' : 'border-ink/25 bg-white'
              }`}
              aria-hidden="true"
            >
              {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
            </span>
            {option}
          </button>
        )
      })}
    </div>
  )
}

function MultiChoiceControl({ question, value, onChange }) {
  const selected = Array.isArray(value) ? value : []
  return (
    <div role="group" aria-label={question.prompt} className="flex flex-col gap-2">
      {question.options.map((option, index) => {
        const on = selected.includes(option)
        return (
          <button
            key={`${option}-${index}`}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? selected.filter((item) => item !== option) : [...selected, option])}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
              on ? 'border-green bg-[#E5F6EC] text-navy' : 'border-[#D5E0EE] bg-white text-navy hover:border-blue/40'
            }`}
          >
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-md border ${
                on ? 'border-green bg-green text-white' : 'border-ink/25 bg-white'
              }`}
              aria-hidden="true"
            >
              {on ? <Check size={11} strokeWidth={3} /> : null}
            </span>
            {option}
          </button>
        )
      })}
    </div>
  )
}
