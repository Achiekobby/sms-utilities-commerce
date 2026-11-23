import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { GroupChoices } from '../../../components/form/GroupChoices'
import { PlaceholderTextarea } from '../../../components/PlaceholderTextarea'
import { apiErrorMessage, fieldErrors } from '../../../features/auth/client'
import { surveyMessagePlaceholders } from '../../../features/templates/templateForm'
import { paths } from '../../../routes/paths'
import { useCreateSurveyMutation, useUpdateSurveyMutation } from '../../../services/api/surveys/surveysApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useGroups } from '../contacts/useGroups'
import { formatCount } from '../dashboard/format'
import { approvedSenderNames } from '../sender-ids/model'
import { useSenderIds } from '../sender-ids/useSenderIds'
import { QuestionList } from './QuestionList'
import { SurveyPhone } from './SurveyPhone'
import { SurveyStartStep } from './SurveyStartStep'
import {
  emptySurvey,
  formValuesFromSurvey,
  formValuesFromTemplate,
  surveyLimits,
  surveyPayload,
  surveySendAt,
  validateSurvey,
} from './model'

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

export function NewSurveyPage({ survey = null }) {
  const editing = Boolean(survey)
  useDocumentTitle(editing ? `Edit ${survey.name}` : 'Create survey')
  const navigate = useNavigate()
  const location = useLocation()
  const seededTemplate =
    !editing && location.state?.template?.type === 'survey' ? location.state.template : null
  const seededValues = seededTemplate ? formValuesFromTemplate(seededTemplate) : null
  const { groups } = useGroups()
  const senders = approvedSenderNames(useSenderIds())
  const [createSurvey, createState] = useCreateSurveyMutation()
  const [updateSurvey, updateState] = useUpdateSurveyMutation()
  const saving = createState.isLoading || updateState.isLoading
  const [started, setStarted] = useState(() => editing || Boolean(seededValues))
  const [templateName] = useState(() => seededTemplate?.name ?? '')
  const [step, setStep] = useState(0)
  const [previewKey, setPreviewKey] = useState(0)
  const [values, setValues] = useState(() =>
    survey ? formValuesFromSurvey(survey) : seededValues ?? emptySurvey,
  )
  const [mirror, setMirror] = useState('welcome')
  const [errors, setErrors] = useState({})
  const bodyRef = useRef(null)

  function insertPlaceholder(token) {
    const field = bodyRef.current
    const body = values.body ?? ''
    const start = field?.selectionStart ?? body.length
    const end = field?.selectionEnd ?? body.length
    const before = body.slice(0, start)
    const gap = before.length > 0 && !/\s$/.test(before) ? ' ' : ''
    const insert = `${gap}${token}`
    const next = `${before}${insert}${body.slice(end)}`.slice(0, surveyLimits.body)
    patch({ body: next })
    const cursor = Math.min(start + insert.length, next.length)
    requestAnimationFrame(() => {
      field?.focus()
      field?.setSelectionRange(cursor, cursor)
    })
  }

  function showQuestion(id, list = values.questions) {
    if (!id) {
      setMirror('welcome')
      return
    }
    const index = list.findIndex((question) => question.id === id)
    setMirror(index < 0 ? 'welcome' : index)
  }
  const selectedGroups = groups.filter((group) => values.groupIds.includes(group.id))
  const draft = values

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
        : found.body
          ? 'survey-body'
          : questionId
            ? `survey-question-${questionId}`
            : found.groupIds
              ? 'survey-groups'
              : found.sender
                ? 'survey-sender'
                : found.sendAt
                  ? 'survey-send-at'
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
      const payload = surveyPayload(values)
      const result = editing
        ? await updateSurvey({ id: survey.id, ...payload }).unwrap()
        : await createSurvey(payload).unwrap()
      navigate(paths.surveys, { state: { saved: result.message || (editing ? 'Survey updated.' : 'Survey created.') } })
    } catch (error) {
      const fields = fieldErrors(error)
      const next = {}
      if (fields.name) next.name = fields.name
      if (fields.intro) next.intro = fields.intro
      if (fields.body) next.body = fields.body
      if (fields.sender) next.sender = fields.sender
      if (fields.send_at) next.sendAt = fields.send_at
      if (fields.contact_group_ids) next.groupIds = fields.contact_group_ids
      const questionMessage = Object.entries(fields).find(([key]) => key === 'questions' || key.startsWith('questions.'))?.[1]
      if (questionMessage) next.questions = questionMessage
      if (!Object.keys(next).length) next.submit = apiErrorMessage(error)
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">{editing ? 'Edit survey' : 'Create survey'}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          {editing
            ? 'Update the details and questions. Move questions up or down to change their order.'
            : started
              ? 'Name the survey, write the invitation, add the questions, then save it as a draft.'
              : 'Start from a survey template or build one from scratch.'}
        </p>
      </header>

      {!editing && !started ? <SurveyStartStep onScratch={() => setStarted(true)} /> : null}

      {started && templateName && !editing ? (
        <p className="mt-5 rounded-xl border border-green/20 bg-[#E8F8EF] px-4 py-3 text-sm text-navy">
          Using <span className="font-semibold">{templateName}</span>. Change anything that should not go out as
          written.
        </p>
      ) : null}

      {started ? (
        <>
      <ol className="mt-5 flex gap-2" aria-label={editing ? 'Edit survey' : 'Create survey'}>
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
                maxLength={surveyLimits.name}
                placeholder="November Customer Satisfaction Survey"
                onChange={(event) => patch({ name: event.target.value })}
                className={`${field} h-11`}
              />
              <Count length={values.name.length} max={surveyLimits.name} />
              <Note id="survey-name-error">{errors.name}</Note>
              <label htmlFor="survey-intro" className="mt-2 mb-1.5 block text-sm font-medium text-navy">
                Introduction <span className="font-normal text-ink/45">optional</span>
              </label>
              <textarea
                id="survey-intro"
                value={values.intro}
                rows={3}
                maxLength={surveyLimits.intro}
                placeholder="Thank you for choosing us. Please take a few minutes to share your feedback."
                onChange={(event) => patch({ intro: event.target.value })}
                className={`${field} resize-none py-2.5`}
              />
              <Count length={values.intro.length} max={surveyLimits.intro} />
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
                Write the SMS, then choose who receives it and when. The survey link is created when the survey is saved.
              </p>
              <label htmlFor="survey-body" className="mt-4 mb-1.5 block text-sm font-medium text-navy">
                Message <span className="font-normal text-ink/45">optional</span>
              </label>
              <div className="mb-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Insert a placeholder">
                {surveyMessagePlaceholders.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => insertPlaceholder(item.token)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-2.5 text-xs font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
                  >
                    {item.label}
                    <span className="font-mono text-[11px] font-medium text-ink/45">{item.token}</span>
                  </button>
                ))}
              </div>
              <p className="mb-2 text-xs leading-5 text-ink/55">
                Each contact gets their own value. A missing field is left blank. The survey link is added automatically when the survey is saved.
              </p>
              <PlaceholderTextarea
                ref={bodyRef}
                id="survey-body"
                value={values.body}
                rows={3}
                maxLength={surveyLimits.body}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Hello {firstName}! We would love to hear your feedback."
                onChange={(event) => patch({ body: event.target.value })}
                className={`${field} resize-none py-2.5`}
              />
              <Count length={values.body.length} max={surveyLimits.body} />
              <Note>{errors.body}</Note>

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
                      const selected = values.groupIds.includes(id)
                      if (!selected && values.groupIds.length >= surveyLimits.groups) {
                        setErrors((current) => ({ ...current, groupIds: `Choose at most ${surveyLimits.groups} contact groups.` }))
                        return
                      }
                      const next = selected
                        ? values.groupIds.filter((item) => item !== id)
                        : [...values.groupIds, id]
                      setErrors((current) => {
                        if (!current.groupIds) return current
                        const rest = { ...current }
                        delete rest.groupIds
                        return rest
                      })
                      patch({ groupIds: next })
                    }}
                  />
                </div>
                <Note>{errors.groupIds}</Note>
              </fieldset>

              <fieldset id="survey-send-at" className="mt-5">
                <legend className="text-sm font-medium text-navy">Send time</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: 'none', label: 'Not scheduled' },
                    { id: 'later', label: 'Schedule' },
                  ].map((item) => {
                    const checked = values.when === item.id
                    return (
                      <label
                        key={item.id}
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold ${
                          checked ? 'border-navy bg-navy text-white' : 'border-ink/15 text-navy hover:border-blue/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="survey-when"
                          value={item.id}
                          checked={checked}
                          onChange={() => patch({ when: item.id, sendAt: item.id === 'none' ? '' : values.sendAt })}
                          className="sr-only"
                        />
                        {item.label}
                      </label>
                    )
                  })}
                </div>
                {values.when === 'later' ? (
                  <input
                    id="survey-send-at-input"
                    type="datetime-local"
                    value={values.sendAt}
                    onChange={(event) => patch({ sendAt: event.target.value })}
                    className={`${field} mt-3 h-11`}
                  />
                ) : null}
                <Note>{errors.sendAt}</Note>
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
              <Fact label="Send time" value={surveySendAt(values) || 'Not scheduled'} />
              <Fact
                label="Groups"
                value={selectedGroups.length ? selectedGroups.map((group) => group.name).join(', ') : 'None'}
              />
              <Fact label="Message" value={values.body.trim() || 'No message'} />
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
              <button type="button" onClick={submit} disabled={saving} className={primary}>
                <Send size={16} strokeWidth={2.3} aria-hidden="true" />
                {saving ? 'Saving…' : editing ? 'Save survey' : 'Create survey'}
              </button>
            </div>
          </section>
        </div>
      )}
        </>
      ) : null}
    </div>
  )
}

function Count({ length, max }) {
  return (
    <p className="mt-1 text-right text-xs text-ink/40 tabular-nums">
      {length}/{max}
    </p>
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
