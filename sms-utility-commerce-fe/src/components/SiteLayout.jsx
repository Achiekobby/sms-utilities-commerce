import { Outlet, useLocation } from 'react-router'
import { paths } from '../routes/paths'
import { useAuth } from '../utils/hooks/useAuth'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { AppNavbar } from './workspace/AppNavbar'

export function SiteLayout() {
  const { pathname } = useLocation()
  const { isAuthenticated, isVerified } = useAuth()
  const signedInDocs = pathname === paths.docs && isAuthenticated && isVerified
  const docsColumn = pathname === paths.docs ? 'lg:pl-[16.5rem]' : ''

  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      {signedInDocs ? <AppNavbar title="API docs" /> : <Navbar />}
      <div className={`flex-1 ${docsColumn}`}>
        <Outlet />
      </div>
      <div className={docsColumn}>
        <Footer />
      </div>
    </div>
  )
}
