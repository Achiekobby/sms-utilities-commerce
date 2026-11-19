import { Check, Loader2, X } from 'lucide-react'

export function AvailabilityMark({ checking, available, taken }) {
  if (checking) {
    return (
      <Loader2
        size={15}
        strokeWidth={2.2}
        aria-hidden="true"
        className="mr-3.5 shrink-0 animate-spin text-ink/40 motion-reduce:animate-none"
      />
    )
  }

  if (available) {
    return <Check size={15} strokeWidth={2.4} aria-hidden="true" className="mr-3.5 shrink-0 text-green" />
  }

  if (taken) {
    return <X size={15} strokeWidth={2.4} aria-hidden="true" className="mr-3.5 shrink-0 text-[#E0232E]" />
  }

  return null
}
