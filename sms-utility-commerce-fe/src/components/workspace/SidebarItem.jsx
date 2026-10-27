import { NavLink } from 'react-router'

const base =
  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm leading-5 transition-colors duration-150 lg:py-2'

// Collapsing only applies from the lg breakpoint up; the mobile drawer is always full width.
function Label({ collapsed, children }) {
  return <span className={collapsed ? 'lg:sr-only' : ''}>{children}</span>
}

export function SidebarItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon
  const align = collapsed ? 'lg:justify-center lg:px-0' : ''

  if (!item.to) {
    return (
      <span
        aria-disabled="true"
        title={collapsed ? `${item.label} · Coming soon` : 'Coming soon'}
        className={`${base} ${align} cursor-default font-medium text-ink/40`}
      >
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-ink/30" />
        <Label collapsed={collapsed}>{item.label}</Label>
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${base} ${align} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
          isActive
            ? 'bg-mint/15 font-semibold text-blue'
            : 'font-medium text-ink/70 hover:bg-canvas hover:text-navy'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span
              aria-hidden="true"
              className="absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-green"
            />
          ) : null}
          <Icon
            size={18}
            strokeWidth={isActive ? 2.2 : 1.8}
            aria-hidden="true"
            className="shrink-0"
          />
          <Label collapsed={collapsed}>{item.label}</Label>
        </>
      )}
    </NavLink>
  )
}
