import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { GroupChoices } from '../../../components/form/GroupChoices'
import { apiErrorMessage, fieldErrors } from '../../../features/auth/client'
import { paths } from '../../../routes/paths'
import { useCreateSurveyMutation } from '../../../services/api/surveys/surveysApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useGroups } from '../contacts/useGroups'
import { formatCount } from '../dashboard/format'
import { approvedSenderNames } from '../sender-ids/model'
import { useSenderIds } from '../sender-ids/useSenderIds'
import { QuestionList } from './QuestionList'
import { SurveyPhone } from './SurveyPhone'
import { emptySurvey, surveyInvitation, surveyPayload, validateSurvey } from './model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-navy outline-none transition-colors placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/10'
const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/20 ${focusClass}`
const secondary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`

function Note({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 min-h-5 text-sm text-[#9F1C26]">
      {children}
    </p>
  )
}

export function NewSurveyPage() {
  useDocumentTitle('Create survey')
  const navigate = useNavigate()
  const { groups } = useGroups()
  const senders = approvedSenderNames(useSenderIds())
  const [createSurvey, createState] = useCreateSurveyMutation()
  const [step, setStep] = useState(0)
  const [previewKey, setPreviewKey] = useState(0)
  const [values, setValues] = useState(emptySurvey)
  const [mirror, setMirror] = useState('welcome')
  const [errors, setErrors] = useState({})

  function showQuestion(id, list = values.questions) {
    if (!id) {
      setMirror('welcome')
      return
    }
    const index = list.findIndex((question) => question.id === id)
    setMirror(index < 0 ? 'welcome' : index)
  }
  const selectedGroups = groups.filter((group) => values.groupIds.includes(group.id))
  const draft = { ...values, body: surveyInvitation }

  function patch(partial) {
    setValues((current) => ({ ...current, ...partial }))
  }

  function reveal(found) {
    setErrors(found)
    const questionId = Object.keys(found.questionsById ?? {})[0]
    const target = found.name
      ? 'survey-name'
      : found.intro
        ? 'survey-intro'
        : questionId
          ? `survey-question-${questionId}`
          : found.groupIds
            ? 'survey-groups'
            : found.sender
              ? 'survey-sender'
              : 'survey-questions'
    window.requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  function openPreview() {
    const found = validateSurvey(values, { senders })
    if (Object.keys(found).length) {
      reveal(found)
      setStep(0)
      return
    }
    setErrors({})
    setPreviewKey((key) => key + 1)
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    const found = validateSurvey(values, { senders })
    if (Object.keys(found).length) {
      reveal(found)
      setStep(0)
      return
    }
    try {
      const result = await createSurvey(surveyPayload(values)).unwrap()
      navigate(paths.surveys, { state: { saved: result.message || 'Survey created.' } })
    } catch (error) {
      const fields = fieldErrors(error)
      const next = {}
      if (fields.name) next.name = fields.name
      if (fields.intro) next.intro = fields.intro
      if (fields.sender) next.sender = fields.sender
      if (fields.contact_group_ids) next.groupIds = fields.contact_group_ids
      if (!Object.keys(next).length) next.submit = fields.body || apiErrorMessage(error)
      setErrors(next)
      if (next.submit) setStep(1)
      else setStep(0)
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Create survey</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Build the questions, walk through them the way a recipient would, then save.
        </p>
      </header>

      <ol className="mt-5 flex gap-2" aria-label="Create survey">
        {['Build', 'Try it'].map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => (index === 1 ? openPreview() : setStep(0))}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold ${focusClass} ${
                step === index ? 'bg-[#062047] text-white' : 'bg-white text-navy ring-1 ring-[#D8E7FA]'
              }`}
            >
              <span className={`flex size-5 items-center justify-center rounded-full text-[11px] ${step === index ? 'bg-white/15' : 'bg-[#E7F1FC] text-blue'}`}>
                {index + 1}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
              <h2 className="text-base font-bold text-navy">Survey</h2>
              <label htmlFor="survey-name" className="mt-4 mb-1.5 block text-sm font-medium text-navy">
                Name
              </label>
              <input
                id="survey-name"
                value={values.name}
                placeholder="NPS Q4"
                onChange={(event) => patch({ name: event.target.value })}
                className={`${field} h-11`}
              />
              <Note id="survey-name-error">{errors.name}</Note>
              <label htmlFor="survey-intro" className="mt-2 mb-1.5 block text-sm font-medium text-navy">
                Introduction
              </label>
              <textarea
                id="survey-intro"
                value={values.intro}
                rows={2}
                placeholder="Help us improve"
                onChange={(event) => patch({ intro: event.target.value })}
                className={`${field} resize-none py-2.5`}
              />
              <Note>{errors.intro}</Note>
            </section>

            <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
              <QuestionList
                questions={values.questions}
                activeId={typeof mirror === 'number' ? values.questions[mirror]?.id : null}
                errors={{ form: errors.questions, byId: errors.questionsById }}
                onChange={(questions) => patch({ questions })}
                onActive={showQuestion}
              />
            </section>

            <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
              <h2 className="text-base font-bold text-navy">Invitation</h2>
              <p className="mt-1 text-sm leading-6 text-ink/55">
                The survey link is added to the invitation automatically. Choose who receives it.
              </p>

              <fieldset id="survey-sender" className="mt-5">
                <legend className="text-sm font-medium text-navy">Sender</legend>
                {senders.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {senders.map((sender) => {
                      const checked = values.sender === sender
                      return (
                        <label
                          key={sender}
                          className={`cursor-pointer rounded-lg border px-3 py-2 font-mono text-sm font-semibold tracking-wide ${
                            checked ? 'border-navy bg-navy text-white' : 'border-ink/15 text-navy hover:border-blue/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="survey-sender"
                            value={sender}
                            checked={checked}
                            onChange={() => patch({ sender })}
                            className="sr-only"
                          />
                          {sender}
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-ink/60">
                    No approved sender yet.{' '}
                    <Link to={paths.senderIds} className="font-semibold text-blue">
                      Sender IDs
                    </Link>
                  </p>
                )}
                <Note>{errors.sender}</Note>
              </fieldset>

              <fieldset id="survey-groups" className="mt-5">
                <legend className="text-sm font-medium text-navy">Contact groups</legend>
                <div className="mt-2">
                  <GroupChoices
                    groups={groups}
                    groupIds={values.groupIds}
                    onToggle={(id) => {
                      const next = values.groupIds.includes(id)
                        ? values.groupIds.filter((item) => item !== id)
                        : [...values.groupIds, id]
                      patch({ groupIds: next })
                    }}
                  />
                </div>
                <Note>{errors.groupIds}</Note>
              </fieldset>
            </section>
          </div>

          <aside className="xl:sticky xl:top-4">
            <div className="rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#E7F6EE,transparent_55%),linear-gradient(180deg,#F4F8FD,#E8F0FA)] px-4 py-5">
              <SurveyPhone
                draft={draft}
                screen={mirror}
                onScreen={(next) => {
                  setMirror(next)
                }}
              />
            </div>
            <button type="button" onClick={openPreview} className={`${primary} mt-4 w-full`}>
              Preview the form
              <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
            </button>
          </aside>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#E7F6EE,transparent_55%),linear-gradient(180deg,#F4F8FD,#E8F0FA)] px-4 py-5">
            <SurveyPhone key={previewKey} draft={draft} />
          </div>
          <section className="rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)]">
            <h2 className="text-base font-bold text-navy">Ready to save</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              Move through the phone as a recipient. Required questions stop you until they are answered. Saving does not send the SMS.
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <Fact label="Survey" value={values.name.trim()} />
              <Fact label="Questions" value={formatCount(values.questions.length)} />
              <Fact label="Sender" value={values.sender} />
              <Fact
                label="Groups"
                value={selectedGroups.length ? selectedGroups.map((group) => group.name).join(', ') : 'None'}
              />
            </dl>
            <ol className="mt-5 flex flex-col gap-2">
              {values.questions.map((question, index) => (
                <li key={question.id} className="flex items-start gap-3 rounded-xl bg-[#F7FAFD] px-3 py-2.5">
                  <span className="mt-0.5 text-xs font-bold text-blue tabular-nums">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-navy">{question.prompt.trim()}</span>
                    <span className="text-xs text-ink/50">
                      {question.type.replaceAll('_', ' ')}
                      {question.required ? ' · required' : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            {errors.submit ? (
              <p role="alert" className="mt-4 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-3 py-2 text-sm text-[#9F1C26]">
                {errors.submit}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EEF8] pt-5">
              <button type="button" onClick={() => setStep(0)} className={secondary}>
                <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
                Back to builder
              </button>
              <button type="button" onClick={submit} disabled={createState.isLoading} className={primary}>
                <Send size={16} strokeWidth={2.3} aria-hidden="true" />
                {createState.isLoading ? 'Saving…' : 'Create survey'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F7FAFD] px-3 py-2.5">
      <dt className="text-[11px] font-semibold tracking-wide text-ink/45 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-navy">{value}</dd>
    </div>
  )
}
