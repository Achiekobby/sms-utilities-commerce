import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router'
import { applyProfile } from '../../features/auth/authSlice'
import { useGetProfileQuery } from '../../services/api/auth/authApi'
import { useDisclosure } from '../../utils/hooks/useDisclosure'
import { useIsDesktop } from '../../utils/hooks/useMediaQuery'
import { usePersistentState } from '../../utils/hooks/usePersistentState'
import { AppNavbar } from './AppNavbar'
import { Sidebar } from './Sidebar'

export function WorkspaceLayout() {
  const dispatch = useDispatch()
  const { data: profile } = useGetProfileQuery()
  const menu = useDisclosure()
  const isDesktop = useIsDesktop()
  const [collapsed, setCollapsed] = usePersistentState('workspace.sidebar.collapsed', false)

  useEffect(() => {
    if (profile) dispatch(applyProfile(profile))
  }, [dispatch, profile])
  // The drawer only exists below lg, so a menu left open never carries over to desktop.
  const drawerOpen = menu.isOpen && !isDesktop

  return (
    <div className="min-h-svh w-full bg-canvas">
      <Sidebar open={drawerOpen} onClose={menu.close} collapsed={collapsed} />

      <div
        className={`min-h-svh w-full min-w-0 transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
          collapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        <AppNavbar
          menuOpen={drawerOpen}
          onMenu={menu.toggle}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
        {/* Pages can set data-page-bleed to cancel main padding and fill the column edge-to-edge. */}
        <main className="w-full min-w-0 px-3 py-5 sm:px-4 sm:py-6 lg:px-5 lg:py-6 xl:px-6 2xl:px-8 has-[[data-page-bleed]]:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
