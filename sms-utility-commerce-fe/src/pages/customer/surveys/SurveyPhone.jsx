import { ArrowLeft, ArrowRight, Check, RotateCcw, Star } from 'lucide-react'
import { useState } from 'react'
import { answerReady, questionTypeMeta } from './model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function messageText(body) {
  const text = String(body ?? '').trim()
  return text || 'Your invitation will appear here.'
}

export function SurveyPhone({ draft, screen: controlledScreen, onScreen }) {
  const questions = draft.questions
  const [localScreen, setLocalScreen] = useState('welcome')
  const [answers, setAnswers] = useState({})
  const [blockedId, setBlockedId] = useState(null)
  const blocked = blockedId != null && blockedId === question?.id
  const screen = controlledScreen === undefined ? localScreen : controlledScreen
  const total = questions.length
  const shown =
    typeof screen === 'number' && (screen < 0 || screen >= total)
      ? total
        ? total - 1
        : 'welcome'
      : screen
  const question = typeof shown === 'number' ? questions[shown] : null

  function go(next) {
    setBlockedId(null)
    if (onScreen) onScreen(next)
    else setLocalScreen(next)
  }

  function nextFrom(current) {
    if (typeof current === 'number') {
      const item = questions[current]
      if (item && !answerReady(item, answers[item.id])) {
        setBlockedId(item.id)
        return
      }
    }
    if (current === 'welcome') go(total ? 0 : 'thanks')
    else if (current === total - 1) go('thanks')
    else if (typeof current === 'number') go(current + 1)
  }

  function backFrom(current) {
    setBlockedId(null)
    if (current === 'thanks') go(total ? total - 1 : 'welcome')
    else if (current === 0) go('welcome')
    else if (typeof current === 'number') go(current - 1)
  }

  function setAnswer(id, value) {
    setAnswers((current) => ({ ...current, [id]: value }))
    setBlockedId(null)
  }

  const progress =
    shown === 'welcome' ? 0 : shown === 'thanks' ? 1 : total ? (shown + 1) / (total + 1) : 0

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.16em] text-ink/45 uppercase">
        {onScreen ? 'Live preview' : 'Respondent preview'}
      </p>
      <div className="rounded-[2rem] bg-[#062047] p-2.5 shadow-[0_24px_50px_-28px_rgba(6,32,71,0.8)]">
        <div className="overflow-hidden rounded-[1.6rem] bg-[#F6F8FC]">
          <div className="flex h-7 items-end justify-center bg-[#062047] pb-1">
            <span className="h-3.5 w-20 rounded-full bg-black/35" />
          </div>
          <div className="flex h-[34rem] flex-col">
            <div className="px-4 pt-3">
              <div className="h-1 overflow-hidden rounded-full bg-[#E3EAF4]">
                <div className="h-full rounded-full bg-green transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {shown === 'welcome' ? (
                <Welcome draft={draft} />
              ) : shown === 'thanks' ? (
                <Thanks name={draft.name} />
              ) : question ? (
                <QuestionView
                  question={question}
                  index={Math.min(shown, total - 1)}
                  total={total}
                  answer={answers[question.id]}
                  blocked={blocked}
                  onAnswer={(value) => setAnswer(question.id, value)}
                />
              ) : (
                <p className="pt-16 text-center text-sm leading-6 text-ink/55">Add a question and it will appear here.</p>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-[#E6EDF6] bg-white px-3 py-3">
              {shown === 'thanks' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({})
                    go('welcome')
                  }}
                  className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#062047] text-sm font-semibold text-white ${focusClass}`}
                >
                  <RotateCcw size={15} strokeWidth={2.3} aria-hidden="true" />
                  Start again
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => backFrom(shown)}
                    disabled={shown === 'welcome'}
                    className={`inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D5E0EE] text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
                  >
                    <ArrowLeft size={15} strokeWidth={2.3} aria-hidden="true" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => nextFrom(shown)}
                    className={`inline-flex h-10 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-green text-sm font-semibold text-white ${focusClass}`}
                  >
                    {shown === 'welcome' ? 'Start' : shown === total - 1 ? 'Finish' : 'Next'}
                    <ArrowRight size={15} strokeWidth={2.3} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Welcome({ draft }) {
  return (
    <div className="flex min-h-full flex-col">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-green uppercase">Survey</p>
      <h2 className="mt-2 text-[1.65rem] leading-tight font-bold tracking-tight text-navy">
        {draft.name.trim() || 'Untitled survey'}
      </h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">{draft.intro.trim() || 'Your introduction will greet people here.'}</p>
      <div className="mt-6 rounded-2xl bg-white p-3 shadow-[0_8px_24px_-18px_rgba(6,32,71,0.7)]">
        <p className="text-[11px] font-semibold tracking-wide text-ink/40 uppercase">{draft.sender || 'Sender'}</p>
        <p className="mt-1.5 text-sm leading-6 whitespace-pre-wrap text-navy">{messageText(draft.body)}</p>
      </div>
    </div>
  )
}

function Thanks({ name }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-3 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#E5F6EC] text-green">
        <Check size={26} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-navy">Thank you</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        {name.trim() ? `That completes ${name.trim()}.` : 'That completes the survey.'} Nothing has been submitted to your contacts.
      </p>
    </div>
  )
}

function QuestionView({ question, index, total, answer, blocked, onAnswer }) {
  const meta = questionTypeMeta(question.type)
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-ink/45 uppercase">
        Question {index + 1} of {total}
        {question.required ? <span className="ml-2 text-[#B45F06]">Required</span> : null}
      </p>
      <h2 className="mt-2 text-xl leading-snug font-bold text-navy">{question.prompt.trim() || 'Untitled question'}</h2>
      <p className="mt-1 text-xs text-ink/45">{meta.hint}</p>
      <div className="mt-5">
        <AnswerControl question={question} answer={answer} onAnswer={onAnswer} />
      </div>
      {blocked ? (
        <p role="alert" className="mt-3 text-sm font-medium text-[#9F1C26]">
          Answer this question to continue.
        </p>
      ) : null}
    </div>
  )
}

function AnswerControl({ question, answer, onAnswer }) {
  if (question.type === 'rating') {
    return (
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => {
          const selected = Number(answer) === score
          return (
            <button
              key={score}
              type="button"
              aria-pressed={selected}
              onClick={() => onAnswer(score)}
              className={`flex h-14 flex-col items-center justify-center rounded-2xl border text-sm font-bold transition-colors ${focusClass} ${
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

  if (question.type === 'yes_no') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[
          ['yes', 'Yes'],
          ['no', 'No'],
        ].map(([value, label]) => {
          const selected = answer === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => onAnswer(value)}
              className={`h-14 rounded-2xl border text-sm font-bold ${focusClass} ${
                selected ? 'border-[#062047] bg-[#062047] text-white' : 'border-[#D5E0EE] bg-white text-navy'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    )
  }

  if (question.type === 'single_choice' || question.type === 'multiple_choice') {
    const options = question.options.map((option) => option.trim()).filter(Boolean)
    if (!options.length) return <p className="text-sm text-ink/50">Options show up here as you add them.</p>
    const selected = question.type === 'multiple_choice' ? (Array.isArray(answer) ? answer : []) : answer
    return (
      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const on = question.type === 'multiple_choice' ? selected.includes(option) : selected === option
          return (
            <button
              key={`${option}-${index}`}
              type="button"
              aria-pressed={on}
              onClick={() => {
                if (question.type === 'single_choice') onAnswer(option)
                else onAnswer(on ? selected.filter((item) => item !== option) : [...selected, option])
              }}
              className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${focusClass} ${
                on ? 'border-green bg-[#E5F6EC] text-navy' : 'border-[#D5E0EE] bg-white text-navy'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    )
  }

  if (question.type === 'long_text') {
    return (
      <textarea
        value={answer ?? ''}
        onChange={(event) => onAnswer(event.target.value)}
        rows={4}
        placeholder="Type a response"
        className={`w-full resize-none rounded-2xl border border-[#D5E0EE] bg-white px-3 py-3 text-sm text-navy outline-none focus:border-blue ${focusClass}`}
      />
    )
  }

  return (
    <input
      value={answer ?? ''}
      onChange={(event) => onAnswer(event.target.value)}
      inputMode={question.type === 'number' ? 'decimal' : 'text'}
      placeholder={question.type === 'number' ? '0' : 'Type a response'}
      className={`h-12 w-full rounded-2xl border border-[#D5E0EE] bg-white px-3 text-sm text-navy outline-none focus:border-blue ${focusClass}`}
    />
  )
}
