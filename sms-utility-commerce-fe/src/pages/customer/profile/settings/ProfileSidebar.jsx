import { settingsSections } from './sections'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function ProfileSidebar({ section, onSelect }) {
  return (
    <nav aria-label="Settings" className="lg:sticky lg:top-20 lg:w-52 lg:shrink-0">
      <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {settingsSections.map((item) => {
          const selected = item.id === section
          return (
            <li key={item.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                aria-current={selected ? 'page' : undefined}
                onClick={() => onSelect(item.id)}
                className={`inline-flex h-10 w-full cursor-pointer items-center rounded-lg px-3 text-sm whitespace-nowrap lg:h-9 ${focusClass} ${
                  selected ? 'bg-[#F3F6FB] font-semibold text-navy' : 'font-medium text-ink/70 hover:bg-white hover:text-navy'
                }`}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
