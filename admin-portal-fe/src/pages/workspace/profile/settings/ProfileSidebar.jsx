import { Settings, Shield, User } from 'lucide-react'
import { settingsSections } from './sections'
import { focusClass } from './ui'

const icons = {
  profile: User,
  account: Settings,
  permissions: Shield,
}

export function ProfileSidebar({ section, onSelect }) {
  return (
    <nav
      aria-label="Profile sections"
      className="rounded-2xl border border-ink/[0.06] bg-white p-3 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.45)] lg:sticky lg:top-[4.25rem] lg:h-[calc(100svh-5.75rem)] lg:w-60 lg:shrink-0"
    >
      <ul className="flex gap-1 overflow-x-auto lg:h-full lg:flex-col lg:gap-1 lg:overflow-visible">
        {settingsSections.map((item) => {
          const selected = item.id === section
          const Icon = icons[item.id] ?? User
          return (
            <li key={item.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                aria-current={selected ? 'page' : undefined}
                onClick={() => onSelect(item.id)}
                className={`relative inline-flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm whitespace-nowrap lg:h-11 lg:pl-5 ${focusClass} ${
                  selected
                    ? 'bg-[#E7F8F0] font-semibold text-green'
                    : 'font-medium text-ink/55 hover:bg-[#F4FBF7] hover:text-navy'
                }`}
              >
                {selected ? (
                  <span aria-hidden="true" className="absolute top-1/2 left-1.5 hidden h-5 w-1 -translate-y-1/2 rounded-full bg-green lg:block" />
                ) : null}
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
