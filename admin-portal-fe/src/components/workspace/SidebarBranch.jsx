import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { useLocation } from 'react-router'
import { paths } from '../../routes/paths'
import { SidebarItem } from './SidebarItem'

function childIsCurrent(pathname, to) {
  if (pathname === to) return true
  return to === paths.clients && pathname.startsWith(`${paths.clients}/`)
}

export function SidebarBranch({ item, iconOnly, onNavigate }) {
  const { pathname } = useLocation()
  const panelId = useId()
  const active = item.children.some((child) => childIsCurrent(pathname, child.to))
  const [userOpen, setUserOpen] = useState(true)
  const open = active || userOpen

  if (iconOnly) {
    return (
      <>
        {item.children.map((child) => (
          <SidebarItem key={child.id} item={child} iconOnly onNavigate={onNavigate} />
        ))}
      </>
    )
  }

  const Icon = item.icon

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setUserOpen((value) => !value)}
        className={`relative flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] leading-5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
          active
            ? 'bg-[#F3F6FB] font-semibold text-navy'
            : 'font-medium text-ink/70 hover:bg-ink/[0.04] hover:text-navy'
        }`}
      >
        <Icon size={16} strokeWidth={active ? 2.15 : 1.75} aria-hidden="true" className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 text-ink/40 transition-transform duration-150 ${open ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>
      {open ? (
        <ul id={panelId} className="mt-0.5 ml-3 space-y-0.5 border-l border-ink/10 pl-2">
          {item.children.map((child) => (
            <li key={child.id}>
              <SidebarItem item={child} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
