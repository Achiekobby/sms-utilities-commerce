export const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export const card =
  'rounded-xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)]'

export const primaryButton = `inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#0056D6] disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`

export const secondaryButton = `inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold whitespace-nowrap text-navy shadow-[0_1px_2px_rgba(16,33,61,0.05)] transition-colors hover:border-blue/40 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`

export const textButton = `inline-flex items-center gap-1.5 rounded text-[13px] font-semibold text-blue hover:text-[#0056D6] ${focusClass}`
