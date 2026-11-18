import { Archive, Ban, CalendarClock, CircleCheck, CircleDashed, LoaderCircle, Pause } from 'lucide-react'
import { surveyStatusLabel } from '../../../features/surveys/surveyRecord'

const tone = {
  draft: 'bg-[#F3F6FB] text-ink/70',
  active: 'bg-[#E5F6EC] text-[#008859]',
  published: 'bg-[#E5F6EC] text-[#008859]',
  live: 'bg-[#E5F6EC] text-[#008859]',
  scheduled: 'bg-[#FFF8EE] text-[#B45F06]',
  sending: 'bg-[#E7F1FC] text-blue',
  completed: 'bg-[#E5F6EC] text-[#008859]',
  paused: 'bg-[#F3F6FB] text-ink/65',
  closed: 'bg-[#EEF2F7] text-ink/55',
  archived: 'bg-[#EEF2F7] text-ink/55',
  cancelled: 'bg-[#F3F6FB] text-ink/55',
}

const icons = {
  draft: CircleDashed,
  active: CircleCheck,
  published: CircleCheck,
  live: CircleCheck,
  scheduled: CalendarClock,
  sending: LoaderCircle,
  completed: CircleCheck,
  paused: Pause,
  closed: Archive,
  archived: Archive,
  cancelled: Ban,
}

export function SurveyStatus({ status }) {
  const key = String(status ?? '').toLowerCase()
  const Icon = icons[key] ?? CircleDashed

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone[key] ?? 'bg-[#FFF4DF] text-[#B45F06]'}`}>
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" className={key === 'sending' ? 'animate-spin' : undefined} />
      {surveyStatusLabel(status)}
    </span>
  )
}
