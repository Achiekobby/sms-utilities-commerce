import { createBrowserRouter, Navigate } from 'react-router'
import { getGuardedRoutes } from '../components/workspace/navigation'
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout'
import { AuthLayout } from '../pages/auth/AuthLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { VerifyPage } from '../pages/auth/VerifyPage'
import { ActivityLogsPage } from '../pages/workspace/activity-logs/ActivityLogsPage'
import { DashboardPage } from '../pages/workspace/DashboardPage'
import { GuardedPage } from '../pages/workspace/GuardedPage'
import { ClientDetailPage } from '../pages/workspace/clients/ClientDetailPage'
import { ClientsPage } from '../pages/workspace/clients/ClientsPage'
import { AdminsPage } from '../pages/workspace/admins/AdminsPage'
import { ClientOnboardingPage } from '../pages/workspace/onboarding/ClientOnboardingPage'
import { AdminOnboardingPage } from '../pages/workspace/onboarding/AdminOnboardingPage'
import { PaymentGatewaysPage } from '../pages/workspace/payment-gateways/PaymentGatewaysPage'
import { PermissionsPage } from '../pages/workspace/roles/PermissionsPage'
import { PlansPage } from '../pages/workspace/plans/PlansPage'
import { RolesPage } from '../pages/workspace/roles/RolesPage'
import { SenderIdsPage } from '../pages/workspace/sender-ids/SenderIdsPage'
import { SubscriptionsPage } from '../pages/workspace/subscriptions/SubscriptionsPage'
import { ProfilePage } from '../pages/workspace/profile/ProfilePage'
import { AuthGuard, GuestGuard, VerifyGuard } from './guards'
import { paths } from './paths'

function elementFor(route) {
  if (route.to === paths.profile) return <ProfilePage />
  if (route.to === paths.clients) return <ClientsPage />
  if (route.to === paths.clientOnboarding) return <ClientOnboardingPage />
  if (route.to === paths.senderIds) return <SenderIdsPage />
  if (route.to === paths.plans) return <PlansPage />
  if (route.to === paths.paymentGateways) return <PaymentGatewaysPage />
  if (route.to === paths.admins) return <AdminsPage />
  if (route.to === paths.adminOnboarding) return <AdminOnboardingPage />
  if (route.to === paths.roles) return <RolesPage />
  if (route.to === paths.permissions) return <PermissionsPage />
  if (route.to === paths.activityLogs) return <ActivityLogsPage />
  if (route.to === paths.subscriptions) return <SubscriptionsPage />
  return <GuardedPage permissions={route.permissions} title={route.label} />
}

const guardedRoutes = getGuardedRoutes().map((route) => ({
  path: route.to.slice(1),
  element: elementFor(route),
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
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'clients/:clientId', element: <ClientDetailPage /> },
          { path: 'sender-ids/:senderId', element: <Navigate to={paths.senderIds} replace /> },
          ...guardedRoutes,
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={paths.login} replace /> },
])
