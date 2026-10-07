import { SidebarItem } from './SidebarItem'

export function SidebarGroup({ group, first, collapsed, onNavigate }) {
  const labelId = `sidebar-${group.id}`

  return (
    <section
      aria-labelledby={group.label ? labelId : undefined}
      className={first ? '' : 'mt-5 border-t border-ink/10 pt-5'}
    >
      {group.label ? (
        <h2
          id={labelId}
          className={`mb-2 px-3 text-[11px] leading-4 font-semibold tracking-[0.14em] text-ink/45 uppercase ${
            collapsed ? 'lg:sr-only' : ''
          }`}
        >
          {group.label}
        </h2>
      ) : null}
      <ul className="space-y-0.5">
        {group.items.map((item) => (
          <li key={item.label}>
            <SidebarItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </section>
  )
}
