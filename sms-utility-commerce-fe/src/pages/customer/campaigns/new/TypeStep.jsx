import { Cake, FileText, Megaphone, PenLine } from 'lucide-react'
import { useNavigate } from 'react-router'
import { paths } from '../../../../routes/paths'
import { campaignTypes } from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const typeLook = {
  occasion: {
    icon: Cake,
    surface:
      'border-[#F9C9A8]/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF8F3_48%,#FFEDE1_100%)] shadow-[0_1px_2px_rgba(194,65,12,0.06),0_14px_28px_-18px_rgba(194,65,12,0.3)]',
    tile: 'bg-[#FFE8D6] text-[#C2410C]',
    selected: 'border-[#C2410C] ring-4 ring-[#C2410C]/15',
  },
  promotion: {
    icon: Megaphone,
    surface:
      'border-[#B9D4F8]/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F9FF_48%,#E8F1FC_100%)] shadow-[0_1px_2px_rgba(20,115,230,0.06),0_14px_28px_-18px_rgba(20,115,230,0.35)]',
    tile: 'bg-[#E7F1FC] text-blue',
    selected: 'border-blue ring-4 ring-blue/15',
  },
}

const startChoices = [
  {
    id: 'template',
    title: 'Use a template',
    detail: 'Preview a saved message, then customize it before sending.',
    icon: FileText,
    surface:
      'border-[#B7E4C7]/70 bg-[linear-gradient(135deg,#FFFFFF_0%,#F3FBF6_48%,#E8F7EE_100%)] shadow-[0_1px_2px_rgba(0,107,70,0.06),0_14px_28px_-18px_rgba(0,107,70,0.35)] hover:border-green/55',
    tile: 'bg-[#DDF3E6] text-green',
  },
  {
    id: 'scratch',
    title: 'Start from scratch',
    detail: 'Choose your audience and write the message yourself.',
    icon: PenLine,
    surface:
      'border-[#B9D4F8]/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F9FF_48%,#E8F1FC_100%)] shadow-[0_1px_2px_rgba(20,115,230,0.06),0_14px_28px_-18px_rgba(20,115,230,0.35)] hover:border-blue/55',
    tile: 'bg-[#E7F1FC] text-blue',
  },
]

export function TypeStep({ values, error, onChange, onScratch }) {
  const navigate = useNavigate()

  function chooseStart(id) {
    if (id === 'template') {
      navigate(paths.templates, { state: { pickFor: 'campaign', campaignType: values.type } })
      return
    }
    onScratch()
  }

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-base font-bold text-navy sm:text-lg">What would you like to send?</legend>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Choose a campaign type based on how you want to reach your customers.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Campaign type">
          {campaignTypes.map((type) => {
            const look = typeLook[type.id]
            const Icon = look.icon
            const selected = values.type === type.id
            return (
              <button
                key={type.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange('type', type.id)}
                className={`start-choice-card relative rounded-2xl border p-5 text-left sm:p-6 ${look.surface} ${
                  selected ? look.selected : ''
                } ${focusClass}`}
              >
                <span className={`start-choice-card__tile relative flex size-12 items-center justify-center rounded-xl ${look.tile}`}>
                  <Icon size={22} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <span className="relative mt-4 block text-[15px] font-bold text-navy">{type.label}</span>
                <span className="relative mt-1.5 block text-sm leading-6 text-ink/60">{type.hint}</span>
                <span className="relative mt-3 flex flex-wrap gap-1.5">
                  {type.examples.map((example) => (
                    <span
                      key={example}
                      className="inline-flex rounded-full border border-ink/10 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-ink/55"
                    >
                      {example}
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-[#E0232E]">
            {error}
          </p>
        ) : null}
      </fieldset>

      {values.type ? (
        <fieldset>
          <legend className="text-base font-bold text-navy">How do you want to start?</legend>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            A template fills the message for you. Starting from scratch leaves every field empty.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {startChoices.map((choice) => {
              const Icon = choice.icon
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => chooseStart(choice.id)}
                  className={`start-choice-card relative rounded-2xl border p-5 text-left sm:p-6 ${choice.surface} ${focusClass}`}
                >
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <span className="start-choice-card__wash absolute -right-8 -bottom-10 size-36 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,33,61,0.05),transparent_68%)] blur-2xl" />
                  </span>
                  <span className={`start-choice-card__tile relative flex size-12 items-center justify-center rounded-xl ${choice.tile}`}>
                    <Icon size={22} strokeWidth={2.1} aria-hidden="true" />
                  </span>
                  <span className="relative mt-4 block text-[15px] font-bold text-navy">{choice.title}</span>
                  <span className="relative mt-1.5 block text-sm leading-6 text-ink/60">{choice.detail}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  )
}
