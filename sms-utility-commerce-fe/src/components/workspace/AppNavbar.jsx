import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { paths } from '../../routes/paths'
import Images from '../../utils/Images'
import { AccountMenu } from './account/AccountMenu'
import { getNavigation } from './navigation'
import { GlobalSearch } from './search/GlobalSearch'
import { WalletBalance } from './WalletBalance'

const iconButton =
  'flex size-8 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-canvas hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

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
      <div className="flex h-14 items-center gap-1.5 px-3 sm:gap-2 sm:px-4 lg:px-6">
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="workspace-nav"
          onClick={onMenu}
          className={`-ml-2 lg:hidden ${iconButton}`}
        >
          {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>

        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          aria-controls="workspace-nav"
          onClick={onToggleCollapse}
          className={`-ml-2 hidden lg:flex ${iconButton}`}
        >
          <CollapseIcon size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>

        <NavLink
          to={paths.dashboard}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue lg:hidden"
        >
          <img src={Images.logo} alt="UtiliSMS" className="h-8 w-auto" />
        </NavLink>

        {section ? (
          <nav aria-label="Breadcrumb" className="hidden shrink-0 items-center gap-1.5 text-[13px] xl:flex">
            <span className="text-ink/45">Workspace</span>
            <span aria-hidden="true" className="text-ink/25">
              /
            </span>
            <span aria-current="page" className="font-semibold text-navy">
              {section}
            </span>
          </nav>
        ) : null}

        <div className="flex min-w-0 flex-1 justify-end md:justify-center md:px-3">
          <GlobalSearch />
        </div>

        <WalletBalance />
        <AccountMenu />
      </div>
    </header>
  )
}
