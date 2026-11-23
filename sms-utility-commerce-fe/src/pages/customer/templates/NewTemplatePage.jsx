import { AlignLeft, ArrowLeft, ArrowRight, Check, CircleDot, GripVertical, Hash, ListChecks, Plus, Star, ToggleLeft, Trash2, Type } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PlaceholderTextarea } from '../../../components/PlaceholderTextarea'
import { apiErrorMessage } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  bodyPlaceholders,
  surveyMessagePlaceholders,
  createTypes,
  ctaKinds,
  emptyQuestion,
  emptyTemplate,
  occasionTypes,
  questionTypes,
  templateCreateBody,
  templateSteps,
  templateToForm,
  validateTemplate,
  validateTemplateStep,
} from '../../../features/templates/templateForm'
import { labelize } from '../../../features/templates/templateModel'
import { paths } from '../../../routes/paths'
import {
  useCreateTemplateMutation,
  useGetTemplateQuery,
  useUpdateTemplateMutation,
} from '../../../services/api/templates/templatesApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { cardClass, focusClass } from './ui'

const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`
const secondary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:border-ink/25 disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`

function FieldError({ id, children }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1.5 text-xs text-[#9F1C26]">
      {children}
    </p>
  )
}

function RequiredMark() {
  return (
    <span className="text-[#E0232E]" aria-hidden="true">
      {' '}
      *
    </span>
  )
}

const questionTypeIcons = {
  rating: Star,
  yes_no: ToggleLeft,
  single_choice: CircleDot,
  multiple_choice: ListChecks,
  number: Hash,
  text: Type,
  long_text: AlignLeft,
}

const questionTypeTone = {
  rating: 'border-[#F6D7A8] bg-[#FFF6E8] text-[#B45309]',
  yes_no: 'border-[#B7E4C7] bg-[#E5F6EC] text-[#008859]',
  single_choice: 'border-[#C5DDF8] bg-[#E7F1FC] text-blue',
  multiple_choice: 'border-[#D4D0F5] bg-[#F3F0FF] text-[#5B4BC4]',
  number: 'border-[#C9E7F2] bg-[#EAF7FB] text-[#0E7490]',
  text: 'border-[#D7DEE8] bg-[#F4F7FB] text-navy',
  long_text: 'border-[#F3D0B5] bg-[#FFF1E8] text-[#C2410C]',
}

function QuestionTypeBadge({ type, label }) {
  const Icon = questionTypeIcons[type] ?? Type
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${questionTypeTone[type] ?? questionTypeTone.text}`}>
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {label}
    </span>
  )
}

function QuestionTypePicker({ labelledBy, value, onChange }) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="mt-2 flex flex-wrap gap-1.5">
      {questionTypes.map((item) => {
        const selected = item.id === value
        const Icon = questionTypeIcons[item.id] ?? Type
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.id)}
            className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-colors ${focusClass} ${
              selected
                ? `${questionTypeTone[item.id] ?? questionTypeTone.text} shadow-[0_1px_2px_rgba(15,35,70,0.06)]`
                : 'border-ink/10 bg-white text-ink/55 hover:border-ink/20 hover:bg-[#F8FAFC] hover:text-navy'
            }`}
          >
            <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function QuestionOptions({ formId, index, options, invalid, onChange }) {
  const rows = options.length ? options : ['']
  return (
    <div>
      <p className="text-sm font-semibold text-navy">Options</p>
      <div className="mt-2 space-y-2">
        {rows.map((option, optionIndex) => (
          <div key={`${index}-option-${optionIndex}`} className="flex items-center gap-2">
            <input
              id={optionIndex === 0 ? `${formId}-question-${index}-options` : undefined}
              value={option}
              placeholder={`Option ${optionIndex + 1}`}
              aria-label={`Option ${optionIndex + 1}`}
              onChange={(event) => {
                const next = [...rows]
                next[optionIndex] = event.target.value
                onChange(next)
              }}
              className={`h-11 min-w-0 flex-1 rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-green ${focusClass} ${
                invalid ? 'border-[#E0232E]' : 'border-ink/10'
              }`}
            />
            <button
              type="button"
              aria-label={`Remove option ${optionIndex + 1}`}
              disabled={rows.length <= 1}
              onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== optionIndex))}
              className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink/45 hover:bg-white hover:text-[#9F1C26] disabled:cursor-not-allowed disabled:opacity-30 ${focusClass}`}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      {rows.length < 20 ? (
        <button
          type="button"
          onClick={() => onChange([...rows, ''])}
          className={`mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-blue ${focusClass}`}
        >
          <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
          Add option
        </button>
      ) : null}
    </div>
  )
}

function inputClass(invalid) {
  return `mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-green ${focusClass} ${
    invalid ? 'border-[#E0232E]' : 'border-ink/10'
  }`
}

function supportsCta(type) {
  return type === 'campaign_promotion' || type === 'campaign_occasion'
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center" aria-label="Add template">
      {templateSteps.map((step, index) => {
        const done = index < current
        const active = index === current
        const reached = done || active
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center" aria-current={active ? 'step' : undefined}>
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  reached ? 'bg-blue text-white shadow-[0_1px_2px_rgba(20,115,230,0.35)]' : 'bg-[#EEF2F7] text-ink/45'
                } ${active ? 'scale-105' : 'scale-100'}`}
              >
                {done ? <Check size={15} strokeWidth={2.6} aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={`hidden truncate text-sm font-semibold transition-colors duration-300 sm:inline ${
                  active ? 'text-navy' : 'text-ink/45'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < templateSteps.length - 1 ? (
              <span aria-hidden="true" className="mx-2 h-0.5 min-w-3 flex-1 overflow-hidden rounded-full bg-ink/10 sm:mx-3">
                <span
                  className={`block h-full rounded-full bg-blue transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    done ? 'w-full' : 'w-0'
                  }`}
                />
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function ReviewRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-ink/[0.06] py-3 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[12px] font-semibold tracking-wide text-ink/45 uppercase">{label}</dt>
      <dd className="min-w-0 text-sm text-ink/80">{children}</dd>
    </div>
  )
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <section className="rounded-xl border border-ink/[0.08] bg-[#F8FAFC] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-navy">{title}</h3>
        {onEdit ? (
          <button type="button" onClick={onEdit} className={`text-[13px] font-semibold text-blue hover:underline ${focusClass}`}>
            Edit
          </button>
        ) : null}
      </div>
      <dl className="mt-2">{children}</dl>
    </section>
  )
}

export function NewTemplatePage() {
  const { templateId } = useParams()
  const editing = Boolean(templateId)
  const notify = useNotify()
  const navigate = useNavigate()
  const formId = useId()
  const bodyRef = useRef(null)
  const [createTemplate, createState] = useCreateTemplateMutation()
  const [updateTemplate, updateState] = useUpdateTemplateMutation()
  const detail = useGetTemplateQuery(templateId, { skip: !editing })
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(emptyTemplate)
  const [errors, setErrors] = useState({})
  const [hydratedId, setHydratedId] = useState('')
  const isLoading = createState.isLoading || updateState.isLoading
  useDocumentTitle(editing ? 'Edit template' : 'New template')

  useEffect(() => {
    if (!editing || !detail.data || hydratedId === detail.data.id) return
    setValues(templateToForm(detail.data))
    setHydratedId(detail.data.id)
    setStep(0)
    setErrors({})
  }, [editing, detail.data, hydratedId])

  const current = templateSteps[step]
  const isLast = step === templateSteps.length - 1
  const showCta = supportsCta(values.type)
  const showOccasion = values.type === 'campaign_occasion'
  const showSurvey = values.type === 'survey'
  const showPlaceholders = values.type !== 'quick_sms'
  const typeMeta = createTypes.find((item) => item.id === values.type)
  const ctaMeta = ctaKinds.find((item) => item.id === values.ctaKind)
  const occasionMeta = occasionTypes.find((item) => item.id === values.occasionType)

  function change(key, value) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }))
    setErrors((currentErrors) => (currentErrors[key] ? { ...currentErrors, [key]: undefined } : currentErrors))
  }

  function setType(type) {
    setValues((currentValues) => ({
      ...currentValues,
      type,
      ctaKind: supportsCta(type) ? currentValues.ctaKind : 'none',
      intro: type === 'survey' ? currentValues.intro : '',
      questions: type === 'survey' ? (currentValues.questions.length ? currentValues.questions : [emptyQuestion()]) : [],
      occasionType: type === 'campaign_occasion' ? currentValues.occasionType || 'birthday' : currentValues.occasionType,
    }))
    setErrors({})
  }

  function insertPlaceholder(token) {
    const field = bodyRef.current
    const body = values.body ?? ''
    if (!field) {
      change('body', `${body}${token}`)
      return
    }
    const start = field.selectionStart ?? body.length
    const end = field.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${token}${body.slice(end)}`
    change('body', next)
    requestAnimationFrame(() => {
      field.focus()
      const cursor = start + token.length
      field.setSelectionRange(cursor, cursor)
    })
  }

  function updateQuestion(index, key, value) {
    setValues((currentValues) => ({
      ...currentValues,
      questions: currentValues.questions.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    }))
    setErrors((currentErrors) => {
      const next = { ...currentErrors }
      delete next[`question-${index}-${key}`]
      delete next.questions
      return next
    })
  }

  function addQuestion() {
    setValues((currentValues) => ({ ...currentValues, questions: [...currentValues.questions, emptyQuestion()] }))
    setErrors((currentErrors) => ({ ...currentErrors, questions: undefined }))
  }

  function removeQuestion(index) {
    setValues((currentValues) => ({
      ...currentValues,
      questions: currentValues.questions.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  function goTo(index, nextErrors = {}) {
    setErrors(nextErrors)
    setStep(index)
  }

  function focusFirstError(found) {
    const first = Object.keys(found)[0]
    if (!first) return
    if (first.startsWith('question-')) {
      const [, index, field] = first.split('-')
      document.getElementById(`${formId}-question-${index}-${field === 'options' ? 'options' : 'prompt'}`)?.focus()
      return
    }
    document.getElementById(`${formId}-${first}`)?.focus()
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!isLast) {
      const found = validateTemplateStep(current.id, values)
      setErrors(found)
      if (Object.keys(found).length) {
        focusFirstError(found)
        return
      }
      setErrors({})
      setStep((index) => Math.min(index + 1, templateSteps.length - 1))
      return
    }

    const found = validateTemplate(values)
    if (Object.keys(found).length) {
      const target = found.type ? 0 : found.name || found.category || found.occasionType ? 1 : 2
      goTo(target, found)
      notify.error('Fix the highlighted fields, then review again.')
      return
    }

    try {
      const body = templateCreateBody(values)
      const result = editing
        ? await updateTemplate({ id: templateId, body }).unwrap()
        : await createTemplate(body).unwrap()
      notify.success(result?.message || (editing ? 'Template updated.' : 'Template created.'))
      navigate(paths.templates)
    } catch (failure) {
      notify.error(apiErrorMessage(failure))
    }
  }

  if (editing && detail.isLoading) {
    return (
      <div role="status" className="space-y-3">
        <span className="sr-only">Loading template</span>
        <span className="skeleton block h-8 w-48 rounded-lg" />
        <span className="skeleton block h-64 rounded-xl" />
      </div>
    )
  }

  if (editing && (detail.isError || !detail.data)) {
    return (
      <div role="alert" className="rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3">
        <p className="text-sm text-[#9F1C26]">This template could not be loaded.</p>
        <Link to={paths.templates} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          Back to templates
        </Link>
      </div>
    )
  }

  if (editing && detail.data && !detail.data.canEdit) {
    return (
      <div className="rounded-xl border border-ink/10 bg-white px-4 py-6">
        <h1 className="text-xl font-bold text-navy">Editing unavailable</h1>
        <p className="mt-2 text-sm text-ink/65">You do not have permission to edit this template.</p>
        <Link to={paths.templates} className={`mt-4 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          Back to templates
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-5 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={paths.templates}
            className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy/70 hover:text-navy ${focusClass}`}
          >
            <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
            All Templates
          </Link>
          <h1 className="mt-2 text-[1.75rem] leading-none font-bold tracking-tight text-navy">
            {editing ? 'Edit template' : 'Add template'}
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            {editing
              ? 'Update this Quick SMS, bulk, campaign, or survey template.'
              : 'Create a reusable Quick SMS, bulk, campaign, or survey template.'}
          </p>
        </div>
      </div>

      <div className={`${cardClass} py-4`}>
        <Stepper current={step} />
      </div>

      <form onSubmit={onSubmit} noValidate className={`${cardClass} space-y-6`}>
        {current.id === 'type' ? (
          <fieldset>
            <legend className="text-base font-bold text-navy">
              Choose template type
              <RequiredMark />
            </legend>
            <p className="mt-1 text-sm text-ink/55">This controls which fields and payload shape are used.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {createTypes.map((item) => {
                const selected = values.type === item.id
                return (
                  <label
                    key={item.id}
                    className={`cursor-pointer rounded-xl border px-3.5 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                      selected ? 'border-green bg-[#E7F8F0]' : 'border-ink/10 hover:border-ink/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${formId}-type`}
                      value={item.id}
                      checked={selected}
                      onChange={() => setType(item.id)}
                      className="sr-only"
                    />
                    <span className={`block text-sm font-semibold ${selected ? 'text-navy' : 'text-ink/80'}`}>{item.label}</span>
                    <span className="mt-0.5 block text-xs text-ink/50">{item.hint}</span>
                  </label>
                )
              })}
            </div>
            <FieldError id={`${formId}-type-error`}>{errors.type}</FieldError>
          </fieldset>
        ) : null}

        {current.id === 'details' ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-navy">Template details</h2>
              <p className="mt-1 text-sm text-ink/55">
                {typeMeta ? `${typeMeta.label} · ${typeMeta.hint}` : 'Name and classify this template.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-name`} className="text-sm font-semibold text-navy">
                  Name
                  <RequiredMark />
                </label>
                <input
                  id={`${formId}-name`}
                  value={values.name}
                  maxLength={120}
                  autoComplete="off"
                  aria-invalid={errors.name ? true : undefined}
                  onChange={(event) => change('name', event.target.value)}
                  className={inputClass(errors.name)}
                />
                <FieldError id={`${formId}-name-error`}>{errors.name}</FieldError>
              </div>

              <div>
                <label htmlFor={`${formId}-category`} className="text-sm font-semibold text-navy">
                  Category
                  <RequiredMark />
                </label>
                <input
                  id={`${formId}-category`}
                  value={values.category}
                  maxLength={80}
                  autoComplete="off"
                  placeholder="e.g. marketing, loyalty"
                  aria-invalid={errors.category ? true : undefined}
                  onChange={(event) => change('category', event.target.value)}
                  className={inputClass(errors.category)}
                />
                <FieldError id={`${formId}-category-error`}>{errors.category}</FieldError>
              </div>

              <div>
                <label htmlFor={`${formId}-status`} className="text-sm font-semibold text-navy">
                  Status
                </label>
                <select
                  id={`${formId}-status`}
                  value={values.status}
                  onChange={(event) => change('status', event.target.value)}
                  className={inputClass(false)}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {showOccasion ? (
                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-navy">
                    Occasion type
                    <RequiredMark />
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {occasionTypes.map((item) => {
                      const selected = values.occasionType === item.id
                      return (
                        <label
                          key={item.id}
                          className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                            selected
                              ? 'border-green bg-[#E7F8F0] font-semibold text-navy'
                              : 'border-ink/10 font-medium text-ink/70'
                          }`}
                        >
                          {item.label}
                          <input
                            type="radio"
                            name={`${formId}-occasion`}
                            value={item.id}
                            checked={selected}
                            onChange={() => change('occasionType', item.id)}
                            className="sr-only"
                          />
                        </label>
                      )
                    })}
                  </div>
                  <FieldError id={`${formId}-occasionType-error`}>{errors.occasionType}</FieldError>
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-description`} className="text-sm font-semibold text-navy">
                  Description
                  <span className="ml-2 text-xs font-medium text-ink/40">Optional</span>
                </label>
                <input
                  id={`${formId}-description`}
                  value={values.description}
                  maxLength={240}
                  autoComplete="off"
                  onChange={(event) => change('description', event.target.value)}
                  className={inputClass(false)}
                />
              </div>
            </div>
          </div>
        ) : null}

        {current.id === 'content' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-navy">Message content</h2>
              <p className="mt-1 text-sm text-ink/55">Write the SMS body and any CTA or survey questions.</p>
            </div>

            {showSurvey ? (
              <div>
                <label htmlFor={`${formId}-intro`} className="text-sm font-semibold text-navy">
                  Survey intro
                  <span className="ml-2 text-xs font-medium text-ink/40">Optional</span>
                </label>
                <textarea
                  id={`${formId}-intro`}
                  value={values.intro}
                  rows={2}
                  maxLength={500}
                  onChange={(event) => change('intro', event.target.value)}
                  className={`mt-2 w-full resize-y rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-green ${focusClass}`}
                />
              </div>
            ) : null}

            <div>
              <label htmlFor={`${formId}-body`} className="text-sm font-semibold text-navy">
                Message body
                <RequiredMark />
              </label>
              {showPlaceholders ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(values.type === 'survey' ? surveyMessagePlaceholders : bodyPlaceholders)
                    .filter((item) => {
                      if (values.type === 'survey') return true
                      if (item.id === 'survey_link') return false
                      if (item.id === 'cta_link') return showCta && values.ctaKind === 'link'
                      return true
                    })
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => insertPlaceholder(item.token)}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink/10 bg-[#F3F6FB] px-2.5 text-[11px] font-semibold text-navy hover:border-blue/40 ${focusClass}`}
                      >
                        {item.label}
                        <span className="font-mono text-[11px] font-medium text-ink/45">{item.token}</span>
                      </button>
                    ))}
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-ink/45">Quick SMS templates usually stay plain — placeholders are optional.</p>
              )}
              <PlaceholderTextarea
                ref={bodyRef}
                id={`${formId}-body`}
                value={values.body}
                rows={5}
                maxLength={1000}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                highlight={showPlaceholders}
                aria-invalid={errors.body ? true : undefined}
                onChange={(event) => change('body', event.target.value)}
                className={`mt-2 w-full resize-y rounded-xl border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-green ${focusClass} ${
                  errors.body ? 'border-[#E0232E]' : 'border-ink/10'
                }`}
              />
              <div className="mt-1 flex items-center justify-between gap-3">
                <FieldError id={`${formId}-body-error`}>{errors.body}</FieldError>
                <p className="ml-auto text-[11px] tabular-nums text-ink/40">{values.body.length}/1000</p>
              </div>
            </div>

            {showCta ? (
              <fieldset>
                <legend className="text-sm font-semibold text-navy">Call to action</legend>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ctaKinds.map((item) => {
                    const selected = values.ctaKind === item.id
                    return (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                          selected
                            ? 'border-green bg-[#E7F8F0] font-semibold text-navy'
                            : 'border-ink/10 font-medium text-ink/70'
                        }`}
                      >
                        {item.label}
                        <input
                          type="radio"
                          name={`${formId}-cta`}
                          value={item.id}
                          checked={selected}
                          onChange={() => change('ctaKind', item.id)}
                          className="sr-only"
                        />
                      </label>
                    )
                  })}
                </div>

                {values.ctaKind !== 'none' ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor={`${formId}-ctaLabel`} className="text-sm font-semibold text-navy">
                        CTA label
                        <RequiredMark />
                      </label>
                      <input
                        id={`${formId}-ctaLabel`}
                        value={values.ctaLabel}
                        maxLength={80}
                        onChange={(event) => change('ctaLabel', event.target.value)}
                        className={inputClass(errors.ctaLabel)}
                      />
                      <FieldError id={`${formId}-ctaLabel-error`}>{errors.ctaLabel}</FieldError>
                    </div>
                    {values.ctaKind === 'link' ? (
                      <div className="sm:col-span-2">
                        <label htmlFor={`${formId}-ctaUrl`} className="text-sm font-semibold text-navy">
                          CTA URL
                          <RequiredMark />
                        </label>
                        <input
                          id={`${formId}-ctaUrl`}
                          type="url"
                          value={values.ctaUrl}
                          placeholder="https://"
                          onChange={(event) => change('ctaUrl', event.target.value)}
                          className={inputClass(errors.ctaUrl)}
                        />
                        <FieldError id={`${formId}-ctaUrl-error`}>{errors.ctaUrl}</FieldError>
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label htmlFor={`${formId}-ctaValue`} className="text-sm font-semibold text-navy">
                          {values.ctaKind === 'ussd' ? 'USSD code' : 'Phone number'}
                          <RequiredMark />
                        </label>
                        <input
                          id={`${formId}-ctaValue`}
                          value={values.ctaValue}
                          placeholder={values.ctaKind === 'ussd' ? '*714*20#' : '0302123456'}
                          onChange={(event) => change('ctaValue', event.target.value)}
                          className={inputClass(errors.ctaValue)}
                        />
                        <FieldError id={`${formId}-ctaValue-error`}>{errors.ctaValue}</FieldError>
                      </div>
                    )}
                  </div>
                ) : null}
              </fieldset>
            ) : null}

            {showSurvey ? (
              <section>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Survey questions
                      <RequiredMark />
                    </h3>
                    <p className="mt-1 text-xs text-ink/50">Order here is the order recipients see.</p>
                  </div>
                  <button type="button" onClick={addQuestion} className={secondary.replace('h-11', 'h-9')}>
                    <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
                    Add question
                  </button>
                </div>
                <FieldError id={`${formId}-questions-error`}>{errors.questions}</FieldError>

                <ul className="mt-4 space-y-3">
                  {values.questions.map((question, index) => {
                    const meta = questionTypes.find((item) => item.id === question.type)
                    const promptError = errors[`question-${index}-prompt`]
                    const optionsError = errors[`question-${index}-options`]
                    return (
                      <li key={question.id} className="rounded-xl border border-ink/[0.08] bg-[#F8FAFC] p-3.5 sm:p-4">
                        <div className="flex items-start gap-2">
                          <span className="mt-2.5 text-ink/35" aria-hidden="true">
                            <GripVertical size={16} />
                          </span>
                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold tracking-wide text-ink/45 uppercase">
                                Question {index + 1}
                              </p>
                              <button
                                type="button"
                                aria-label={`Remove question ${index + 1}`}
                                disabled={values.questions.length <= 1}
                                onClick={() => removeQuestion(index)}
                                className={`inline-flex size-8 items-center justify-center rounded-lg text-ink/45 hover:bg-white hover:text-[#9F1C26] disabled:cursor-not-allowed disabled:opacity-30 ${focusClass}`}
                              >
                                <Trash2 size={15} aria-hidden="true" />
                              </button>
                            </div>

                            <div>
                              <label htmlFor={`${formId}-question-${index}-prompt`} className="text-sm font-semibold text-navy">
                                Prompt
                              </label>
                              <input
                                id={`${formId}-question-${index}-prompt`}
                                value={question.prompt}
                                onChange={(event) => updateQuestion(index, 'prompt', event.target.value)}
                                className={inputClass(promptError)}
                              />
                              <FieldError id={`${formId}-question-${index}-prompt-error`}>{promptError}</FieldError>
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p id={`${formId}-question-${index}-type`} className="text-sm font-semibold text-navy">
                                  Type
                                </p>
                                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink/75">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(question.required)}
                                    onChange={(event) => updateQuestion(index, 'required', event.target.checked)}
                                    className="size-4 rounded border-ink/20 text-green focus:ring-green"
                                  />
                                  Required
                                </label>
                              </div>
                              <QuestionTypePicker
                                labelledBy={`${formId}-question-${index}-type`}
                                value={question.type}
                                onChange={(type) => updateQuestion(index, 'type', type)}
                              />
                            </div>

                            {meta?.needsOptions ? (
                              <div>
                                <QuestionOptions
                                  formId={formId}
                                  index={index}
                                  options={Array.isArray(question.options) ? question.options : ['']}
                                  invalid={Boolean(optionsError)}
                                  onChange={(options) => updateQuestion(index, 'options', options)}
                                />
                                <FieldError id={`${formId}-question-${index}-options-error`}>{optionsError}</FieldError>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}

        {current.id === 'review' ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-navy">Review</h2>
              <p className="mt-1 text-sm text-ink/55">Confirm everything looks right before creating the template.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ReviewCard title="Type & details" onEdit={() => goTo(1)}>
                <ReviewRow label="Type">{typeMeta?.label ?? labelize(values.type)}</ReviewRow>
                <ReviewRow label="Name">{values.name || '—'}</ReviewRow>
                <ReviewRow label="Category">{values.category || '—'}</ReviewRow>
                <ReviewRow label="Status">{labelize(values.status)}</ReviewRow>
                {showOccasion ? <ReviewRow label="Occasion">{occasionMeta?.label ?? labelize(values.occasionType)}</ReviewRow> : null}
                <ReviewRow label="Description">{values.description.trim() || '—'}</ReviewRow>
              </ReviewCard>

              <ReviewCard title="Message" onEdit={() => goTo(2)}>
                {showSurvey && values.intro.trim() ? <ReviewRow label="Intro">{values.intro}</ReviewRow> : null}
                <ReviewRow label="Body">
                  <p className="whitespace-pre-wrap break-words">{values.body || '—'}</p>
                </ReviewRow>
                {showCta ? (
                  <ReviewRow label="CTA">
                    {values.ctaKind === 'none'
                      ? 'None'
                      : `${ctaMeta?.label ?? values.ctaKind}${values.ctaLabel ? ` · ${values.ctaLabel}` : ''}${
                          values.ctaKind === 'link' && values.ctaUrl
                            ? ` · ${values.ctaUrl}`
                            : values.ctaValue
                              ? ` · ${values.ctaValue}`
                              : ''
                        }`}
                  </ReviewRow>
                ) : null}
              </ReviewCard>
            </div>

            {showSurvey ? (
              <ReviewCard title="Survey questions" onEdit={() => goTo(2)}>
                {values.questions.length ? (
                  <ul className="space-y-3">
                    {values.questions.map((question, index) => {
                      const meta = questionTypes.find((item) => item.id === question.type)
                      const options = (Array.isArray(question.options) ? question.options : [])
                        .map((item) => item.trim())
                        .filter(Boolean)
                      return (
                        <li key={question.id} className="rounded-lg border border-ink/[0.06] bg-white px-3 py-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold tracking-wide text-ink/40 uppercase">Q{index + 1}</span>
                            <QuestionTypeBadge type={question.type} label={meta?.label ?? question.type} />
                            {question.required ? (
                              <span className="inline-flex items-center rounded-full border border-ink/10 bg-[#F4F7FB] px-2 py-0.5 text-[11px] font-semibold text-ink/55">
                                Required
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-ink/80">{question.prompt || '—'}</p>
                          {options.length ? (
                            <p className="mt-1 text-xs text-ink/50">{options.join(' · ')}</p>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-ink/50">No questions added.</p>
                )}
              </ReviewCard>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => goTo(1)} className={secondary}>
                Edit details
              </button>
              <button type="button" onClick={() => goTo(2)} className={secondary}>
                Edit content
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/[0.06] pt-5">
          <div className="flex flex-wrap gap-2">
            {step === 0 ? (
              <Link to={paths.templates} className={secondary}>
                Cancel
              </Link>
            ) : (
              <button type="button" disabled={isLoading} onClick={() => goTo(step - 1)} className={secondary}>
                <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
                Back
              </button>
            )}
          </div>
          <button type="submit" disabled={isLoading} className={primary}>
            {isLast ? (
              isLoading ? (
                editing ? 'Saving…' : 'Creating…'
              ) : editing ? (
                'Save changes'
              ) : (
                'Create template'
              )
            ) : (
              <>
                Continue
                <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
