import { ClipboardList, FileText, PenLine } from 'lucide-react'
import { useNavigate } from 'react-router'
import { paths } from '../../../routes/paths'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const startChoices = [
  {
    id: 'template',
    title: 'Use a template',
    detail: 'Preview a survey template, then customize questions and invitation before saving.',
    icon: FileText,
    surface:
      'border-[#B7E4C7]/70 bg-[linear-gradient(135deg,#FFFFFF_0%,#F3FBF6_48%,#E8F7EE_100%)] shadow-[0_1px_2px_rgba(0,107,70,0.06),0_14px_28px_-18px_rgba(0,107,70,0.35)] hover:border-green/55',
    tile: 'bg-[#DDF3E6] text-green',
  },
  {
    id: 'scratch',
    title: 'Start from scratch',
    detail: 'Write the invitation and questions yourself with a blank form.',
    icon: PenLine,
    surface:
      'border-[#B9D4F8]/80 bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F9FF_48%,#E8F1FC_100%)] shadow-[0_1px_2px_rgba(20,115,230,0.06),0_14px_28px_-18px_rgba(20,115,230,0.35)] hover:border-blue/55',
    tile: 'bg-[#E7F1FC] text-blue',
  },
]

export function SurveyStartStep({ onScratch }) {
  const navigate = useNavigate()

  return (
    <section className="mt-6 rounded-2xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.05)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F1FC] text-blue">
          <ClipboardList size={20} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-navy sm:text-lg">How do you want to start?</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            Survey templates fill in the name, invitation, and questions. You can still change anything before
            you save.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {startChoices.map((choice) => {
          const Icon = choice.icon
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => {
                if (choice.id === 'template') {
                  navigate(paths.templates, { state: { pickFor: 'survey' } })
                  return
                }
                onScratch()
              }}
              className={`start-choice-card relative rounded-2xl border p-5 text-left sm:p-6 ${choice.surface} ${focusClass}`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              >
                <span className="start-choice-card__wash absolute -right-8 -bottom-10 size-36 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,33,61,0.05),transparent_68%)] blur-2xl" />
              </span>
              <span
                className={`start-choice-card__tile relative flex size-12 items-center justify-center rounded-xl ${choice.tile}`}
              >
                <Icon size={22} strokeWidth={2.1} aria-hidden="true" />
              </span>
              <span className="relative mt-4 block text-[15px] font-bold text-navy">{choice.title}</span>
              <span className="relative mt-1.5 block text-sm leading-6 text-ink/60">{choice.detail}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
