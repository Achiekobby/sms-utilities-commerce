import { createBrowserRouter, Navigate } from 'react-router'
import { getGuardedRoutes } from '../components/workspace/navigation'
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout'
import { AuthLayout } from '../pages/auth/AuthLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { VerifyPage } from '../pages/auth/VerifyPage'
import { DashboardPage } from '../pages/workspace/DashboardPage'
import { GuardedPage } from '../pages/workspace/GuardedPage'
import { ProfilePage } from '../pages/workspace/profile/ProfilePage'
import { AuthGuard, GuestGuard, VerifyGuard } from './guards'
import { paths } from './paths'

const guardedRoutes = getGuardedRoutes().map((route) => ({
  path: route.to.slice(1),
  element:
    route.to === paths.profile ? (
      <ProfilePage />
    ) : (
      <GuardedPage permissions={route.permissions} title={route.label} summary={route.summary} />
    ),
}))

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        element: <GuestGuard />,
        children: [{ path: paths.login, element: <LoginPage /> }],
      },
      {
        element: <VerifyGuard />,
        children: [{ path: paths.verify, element: <VerifyPage /> }],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <WorkspaceLayout />,
        children: [{ index: true, element: <DashboardPage /> }, ...guardedRoutes],
      },
    ],
  },
  { path: '*', element: <Navigate to={paths.login} replace /> },
])
