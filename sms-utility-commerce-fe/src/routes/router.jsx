import { Navigate, createBrowserRouter } from 'react-router'
import { AuthLayout } from '../components/AuthLayout'
import { SiteLayout } from '../components/SiteLayout'
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { VerifyPage } from '../pages/auth/VerifyPage'
import { ContactGroupPage } from '../pages/customer/contacts/ContactGroupPage'
import { ContactsPage } from '../pages/customer/contacts/ContactsPage'
import { ContactsUploadPage } from '../pages/customer/contacts/upload/ContactsUploadPage'
import { DashboardPage } from '../pages/customer/dashboard/DashboardPage'
import { HelpPage } from '../pages/guest/HelpPage'
import { HomePage } from '../pages/guest/HomePage'
import { PricingPage } from '../pages/guest/PricingPage'
import { TermsPage } from '../pages/guest/TermsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AuthGuard, CustomerGuard, GuestGuard, VerifyGuard } from './guards'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GuestGuard />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { index: true, element: <HomePage />, handle: { allowAuthenticated: true } },
          {
            path: 'pricing',
            element: <PricingPage />,
            handle: { allowAuthenticated: true },
          },
          {
            path: 'help',
            element: <HelpPage />,
            handle: { allowAuthenticated: true },
          },
          {
            path: 'terms',
            element: <TermsPage />,
            handle: { allowAuthenticated: true },
          },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    element: <VerifyGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: 'verify', element: <VerifyPage /> }],
      },
    ],
  },
  {
    path: 'app',
    element: <CustomerGuard />,
    children: [
      {
        element: <WorkspaceLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'contacts', element: <ContactsPage /> },
          { path: 'contacts/:groupId', element: <ContactGroupPage /> },
          { path: 'contacts/:groupId/upload', element: <ContactsUploadPage /> },
        ],
      },
    ],
  },
  {
    element: <SiteLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
])
