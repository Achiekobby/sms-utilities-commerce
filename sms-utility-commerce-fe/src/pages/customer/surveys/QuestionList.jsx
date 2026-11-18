import {
  AlignLeft,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Copy,
  Hash,
  ListChecks,
  Plus,
  Star,
  ToggleLeft,
  Trash2,
  Type,
} from 'lucide-react'
import { isChoiceType, newQuestion, questionTypes, withQuestionType } from './model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-navy outline-none transition-colors placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/10'

const icons = {
  rating: Star,
  single_choice: CircleDot,
  multiple_choice: ListChecks,
  text: Type,
  long_text: AlignLeft,
  yes_no: ToggleLeft,
  number: Hash,
}

export function QuestionList({ questions, activeId, errors = {}, onChange, onActive }) {
  function update(id, partial) {
    onChange(questions.map((question) => (question.id === id ? { ...question, ...partial } : question)))
  }

  function add(type) {
    const question = newQuestion(type)
    const next = [...questions, question]
    onChange(next)
    onActive(question.id, next)
  }

  return (
    <div id="survey-questions">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy">Questions</h2>
          <p className="mt-1 text-sm text-ink/55">Add a field, write the prompt, then try it in the phone.</p>
        </div>
        <p className="text-sm font-semibold text-navy tabular-nums">{questions.length}</p>
      </div>

      {errors.form ? (
        <p role="alert" className="mt-3 text-sm text-[#9F1C26]">
          {errors.form}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        {questions.map((question, index) => {
          const Icon = icons[question.type] ?? Type
          const active = question.id === activeId
          const fieldErrors = errors.byId?.[question.id] ?? {}
          return (
            <article
              key={question.id}
              id={`survey-question-${question.id}`}
              className={`rounded-2xl border bg-white p-4 transition-shadow ${
                active ? 'border-blue shadow-[0_10px_30px_-22px_rgba(20,115,230,0.9)]' : 'border-[#D8E7FA]'
              }`}
              onClick={() => onActive(question.id, questions)}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E7F1FC] text-blue">
                  <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`question-type-${question.id}`}>
                      Question type
                    </label>
                    <select
                      id={`question-type-${question.id}`}
                      value={question.type}
                      onChange={(event) => update(question.id, withQuestionType(question, event.target.value))}
                      className={`${field} h-9 w-auto pr-8 font-semibold`}
                    >
                      {questionTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-ink/45">{questionTypes.find((type) => type.id === question.type)?.hint}</span>
                  </div>
                  <label className="sr-only" htmlFor={`question-prompt-${question.id}`}>
                    Question
                  </label>
                  <textarea
                    id={`question-prompt-${question.id}`}
                    value={question.prompt}
                    rows={2}
                    placeholder="Ask something clear"
                    onChange={(event) => update(question.id, { prompt: event.target.value })}
                    className={`${field} mt-3 resize-none py-2.5 text-base font-medium`}
                  />
                  {fieldErrors.prompt ? (
                    <p role="alert" className="mt-1.5 text-sm text-[#9F1C26]">
                      {fieldErrors.prompt}
                    </p>
                  ) : null}
                  {isChoiceType(question.type) ? (
                    <Options
                      question={question}
                      error={fieldErrors.options}
                      onChange={(options) => update(question.id, { options })}
                    />
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E7EEF8] pt-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(event) => update(question.id, { required: event.target.checked })}
                    className="size-4 accent-green"
                  />
                  Required
                </label>
                <div className="flex items-center gap-1">
                  <IconButton label="Move up" disabled={index === 0} onClick={() => shift(questions, index, -1, onChange, onActive)}>
                    <ChevronUp size={16} strokeWidth={2.3} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={index === questions.length - 1}
                    onClick={() => shift(questions, index, 1, onChange, onActive)}
                  >
                    <ChevronDown size={16} strokeWidth={2.3} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Duplicate question"
                    onClick={() => {
                      const copy = { ...newQuestion(question.type), prompt: question.prompt, required: question.required, options: [...question.options] }
                      const next = [...questions]
                      next.splice(index + 1, 0, copy)
                      onChange(next)
                      onActive(copy.id, next)
                    }}
                  >
                    <Copy size={15} strokeWidth={2.2} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Delete question"
                    onClick={() => {
                      const next = questions.filter((item) => item.id !== question.id)
                      onChange(next)
                      onActive(next[Math.max(0, index - 1)]?.id ?? null, next)
                    }}
                  >
                    <Trash2 size={15} strokeWidth={2.2} aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-[#B9D0EE] bg-[#F7FAFE] p-3">
        <p className="px-1 text-xs font-semibold tracking-wide text-ink/45 uppercase">Add a field</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {questionTypes.map((type) => {
            const Icon = icons[type.id] ?? Plus
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => add(type.id)}
                className={`flex items-center gap-2 rounded-xl border border-white bg-white px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(20,115,230,0.05)] transition-colors hover:border-blue/40 ${focusClass}`}
              >
                <Icon size={15} strokeWidth={2.2} className="shrink-0 text-blue" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-navy">{type.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Options({ question, error, onChange }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-ink/50">Options</p>
      <div className="mt-2 flex flex-col gap-2">
        {question.options.map((option, index) => (
          <div key={`${question.id}-option-${index}`} className="flex items-center gap-2">
            <input
              value={option}
              placeholder={`Option ${index + 1}`}
              aria-label={`Option ${index + 1}`}
              onChange={(event) => {
                const next = [...question.options]
                next[index] = event.target.value
                onChange(next)
              }}
              className={`${field} h-10`}
            />
            <IconButton
              label={`Remove option ${index + 1}`}
              onClick={() => onChange(question.options.filter((_, optionIndex) => optionIndex !== index))}
            >
              <Trash2 size={15} strokeWidth={2.2} aria-hidden="true" />
            </IconButton>
          </div>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-[#9F1C26]">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => onChange([...question.options, ''])}
        className={`mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-blue ${focusClass}`}
      >
        <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
        Add option
      </button>
    </div>
  )
}

function shift(questions, index, direction, onChange, onActive) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= questions.length) return
  const next = [...questions]
  const [item] = next.splice(index, 1)
  next.splice(nextIndex, 0, item)
  onChange(next)
  onActive(item.id, next)
}

function IconButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={`inline-flex size-8 items-center justify-center rounded-lg text-navy hover:bg-[#F3F7FD] disabled:cursor-not-allowed disabled:opacity-35 ${focusClass}`}
    >
      {children}
    </button>
  )
}
