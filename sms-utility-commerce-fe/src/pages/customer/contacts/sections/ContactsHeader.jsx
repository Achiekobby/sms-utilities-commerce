import { Plus } from 'lucide-react'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const primary = `inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`

export function ContactsHeader({ onCreateGroup }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">
          Contact Groups
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          Organize contacts into groups and manage the members inside each group.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
        <button type="button" onClick={onCreateGroup} className={primary}>
          <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
          Create Group
        </button>
      </div>
    </header>
  )
}
