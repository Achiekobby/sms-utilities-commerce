import { NavLink } from 'react-router'
import { paths } from '../../routes/paths'
import { isComingSoon } from './navigation'

const row =
  'group relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] leading-5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SidebarItem({ item, iconOnly, onNavigate }) {
  const Icon = item.icon
  const comingSoon = isComingSoon(item.to)

  return (
    <NavLink
      to={item.to}
      end={item.to !== paths.clients}
      title={iconOnly ? (comingSoon ? `${item.label}, coming soon` : item.label) : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${row} ${iconOnly ? 'lg:justify-center lg:px-0' : ''} ${
          isActive
            ? 'bg-[#F3F6FB] font-semibold text-navy'
            : 'font-medium text-ink/70 hover:bg-ink/[0.04] hover:text-navy'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span aria-hidden="true" className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-green" />
          ) : null}
          <Icon size={16} strokeWidth={isActive ? 2.15 : 1.75} aria-hidden="true" className="shrink-0" />
          <span className={iconOnly ? 'lg:sr-only' : 'min-w-0 flex-1 truncate'}>{item.label}</span>
          {comingSoon ? (
            <span className={iconOnly ? 'sr-only' : 'inline-flex h-4 shrink-0 items-center rounded-full bg-ink/[0.06] px-1.5 text-[10px] leading-none font-semibold tracking-wide text-ink/45 uppercase'}>
              {iconOnly ? 'Coming soon' : <span aria-hidden="true">Soon</span>}
              {iconOnly ? null : <span className="sr-only">Coming soon</span>}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}
