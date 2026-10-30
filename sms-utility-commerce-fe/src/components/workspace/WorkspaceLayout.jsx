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
    <div className="min-h-svh bg-canvas">
      <Sidebar open={drawerOpen} onClose={menu.close} collapsed={collapsed} />

      <div
        className={`w-full min-w-0 transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
          collapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        <AppNavbar
          menuOpen={drawerOpen}
          onMenu={menu.toggle}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10 2xl:px-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
