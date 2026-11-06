export const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
export const errorColor = '#E0232E'

export function inputClass(invalid) {
  return `h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink/35 ${focusClass} ${
    invalid ? 'border-[#E0232E] focus:border-[#E0232E]' : 'border-ink/10 focus:border-green'
  }`
}
export const cardClass =
  'rounded-2xl border border-ink/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.45)] sm:p-6'
export const headClass =
  'bg-[#F3F6FB] px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
export const cellClass = 'border-b border-ink/[0.06] px-3 py-3.5 text-sm whitespace-nowrap text-ink/75'
