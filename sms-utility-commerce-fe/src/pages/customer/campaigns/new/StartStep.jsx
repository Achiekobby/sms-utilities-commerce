import { FileText, PenLine } from 'lucide-react'
import { useNavigate } from 'react-router'
import { paths } from '../../../../routes/paths'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const choices = [
  {
    id: 'template',
    title: 'Use a template',
    detail: 'Preview a saved message, then edit it in this form before it sends.',
    icon: FileText,
    tile: 'bg-mint/15 text-green',
  },
  {
    id: 'scratch',
    title: 'Start from scratch',
    detail: 'Choose the groups and write the message yourself.',
    icon: PenLine,
    tile: 'bg-blue/10 text-blue',
  },
]

export function StartStep({ onScratch }) {
  const navigate = useNavigate()

  function choose(id) {
    if (id === 'template') {
      navigate(paths.templates, { state: { pickFor: 'campaign' } })
      return
    }
    onScratch()
  }

  return (
    <fieldset>
      <legend className="text-base font-bold text-navy">How do you want to start?</legend>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
        A template fills the message for you. Starting from scratch leaves every field empty.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {choices.map((choice) => {
          const Icon = choice.icon
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => choose(choice.id)}
              className={`rounded-xl border-2 border-ink/15 bg-white p-4 text-left transition-colors duration-200 hover:border-blue/40 ${focusClass}`}
            >
              <span className={`flex size-10 items-center justify-center rounded-xl ${choice.tile}`}>
                <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className="mt-3 block text-sm font-semibold text-navy">{choice.title}</span>
              <span className="mt-1 block text-sm leading-6 text-ink/60">{choice.detail}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
