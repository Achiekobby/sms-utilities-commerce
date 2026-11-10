import { Hash, MessageSquarePlus, Plus, Users } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function MessagesEmpty() {
  return (
    <section
      aria-labelledby="messages-empty-heading"
      className="relative mt-6 overflow-hidden rounded-2xl border border-[#D8E7FA] bg-gradient-to-br from-white via-[#F7FBFF] to-[#EAF4FF] px-5 py-14 text-center shadow-[0_1px_2px_rgba(20,115,230,0.05),0_22px_48px_-28px_rgba(20,115,230,0.35)] sm:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-blue/[0.08] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-8 size-52 rounded-full bg-green/[0.08] blur-2xl"
      />

      <span className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-blue shadow-[0_10px_28px_-16px_rgba(20,115,230,0.65)] ring-1 ring-blue/15">
        <MessageSquarePlus size={28} strokeWidth={1.8} aria-hidden="true" />
      </span>

      <h2 id="messages-empty-heading" className="relative mt-5 text-xl font-bold tracking-tight text-navy sm:text-2xl">
        No messages yet
      </h2>
      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60 sm:text-[15px]">
        Write your first SMS to numbers you type or to contact groups. Delivery reports for every send will show up
        here.
      </p>

      <ul className="relative mx-auto mt-6 flex max-w-lg flex-wrap items-center justify-center gap-2">
        <li className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy">
          <Hash size={13} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
          To numbers
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy">
          <Users size={13} strokeWidth={2.2} aria-hidden="true" className="text-green" />
          To groups
        </li>
      </ul>

      <Link
        to={paths.newMessage}
        className={`relative mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`}
      >
        <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
        New message
      </Link>
    </section>
  )
}
