import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { paths } from '../../routes/paths'
import Images from '../../utils/Images'
import { AccountMenu } from './account/AccountMenu'
import { getNavigation } from './navigation'
import { GlobalSearch } from './search/GlobalSearch'

const iconButton =
  'flex size-10 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-canvas hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function useCurrentSection() {
  const { pathname } = useLocation()

  return (
    getNavigation({ isBusiness: true })
      .flatMap((group) => group.items)
      .find((item) => item.to && (pathname === item.to || pathname.startsWith(`${item.to}/`)))?.label ?? ''
  )
}

export function AppNavbar({ menuOpen, onMenu, collapsed, onToggleCollapse }) {
  const section = useCurrentSection()
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_rgba(16,33,61,0.04),0_14px_32px_-14px_rgba(11,31,91,0.26)]">
      <div className="flex h-18 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8 xl:px-10">
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="workspace-nav"
          onClick={onMenu}
          className={`-ml-2 lg:hidden ${iconButton}`}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          aria-controls="workspace-nav"
          onClick={onToggleCollapse}
          className={`-ml-2 hidden lg:flex ${iconButton}`}
        >
          <CollapseIcon size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>

        <NavLink
          to={paths.dashboard}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue lg:hidden"
        >
          <img src={Images.logo} alt="UtiliSMS" className="h-10 w-auto sm:h-13" />
        </NavLink>

        {section ? (
          <nav aria-label="Breadcrumb" className="hidden shrink-0 items-center gap-2 text-sm xl:flex">
            <span className="text-ink/45">Workspace</span>
            <span aria-hidden="true" className="text-ink/25">
              /
            </span>
            <span aria-current="page" className="font-semibold text-navy">
              {section}
            </span>
          </nav>
        ) : null}

        <div className="flex min-w-0 flex-1 justify-end md:justify-center md:px-4">
          <GlobalSearch />
        </div>

        <AccountMenu />
      </div>
    </header>
  )
}
