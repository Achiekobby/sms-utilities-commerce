import { Check } from 'lucide-react'

const uploadSteps = ['Get template', 'Upload file', 'Review', 'Import']

// Shows where the user is in the flow. `current` is the index of the active step; earlier steps are done.
export function UploadStepper({ current }) {
  return (
    <ol aria-label="Progress" className="flex items-center">
      {uploadSteps.map((label, index) => {
        const done = index < current
        const active = index === current

        return (
          <li key={label} className={`flex items-center ${index < uploadSteps.length - 1 ? 'flex-1' : ''}`}>
            <span
              aria-current={active ? 'step' : undefined}
              className="flex items-center gap-2.5"
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors ${
                  done
                    ? 'bg-green text-white'
                    : active
                      ? 'bg-blue text-white shadow-[0_0_0_4px_rgba(20,115,230,0.15)]'
                      : 'bg-[#E4ECFA] text-ink/55'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={`text-[13px] font-semibold whitespace-nowrap ${
                  active ? 'text-navy' : done ? 'text-ink/70' : 'text-ink/45'
                } ${active ? '' : 'hidden sm:inline'}`}
              >
                {label}
                <span className="sr-only">{done ? ' (done)' : active ? ' (current step)' : ''}</span>
              </span>
            </span>
            {index < uploadSteps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`mx-3 h-0.5 min-w-4 flex-1 rounded-full transition-colors ${done ? 'bg-green/60' : 'bg-[#E4ECFA]'}`}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
