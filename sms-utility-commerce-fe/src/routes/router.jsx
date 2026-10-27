import { Navigate, createBrowserRouter } from 'react-router'
import { AuthLayout } from '../components/AuthLayout'
import { SiteLayout } from '../components/SiteLayout'
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { VerifyPage } from '../pages/auth/VerifyPage'
import { CampaignDetailPage } from '../pages/customer/campaigns/CampaignDetailPage'
import { CampaignsPage } from '../pages/customer/campaigns/CampaignsPage'
import { NewCampaignPage } from '../pages/customer/campaigns/new/NewCampaignPage'
import { MessageDetailPage } from '../pages/customer/messages/MessageDetailPage'
import { MessagesPage } from '../pages/customer/messages/MessagesPage'
import { NewMessagePage } from '../pages/customer/messages/new/NewMessagePage'
import { ContactGroupPage } from '../pages/customer/contacts/ContactGroupPage'
import { ContactsPage } from '../pages/customer/contacts/ContactsPage'
import { ContactsUploadPage } from '../pages/customer/contacts/upload/ContactsUploadPage'
import { DashboardPage } from '../pages/customer/dashboard/DashboardPage'
import { ProfilePage } from '../pages/customer/profile/ProfilePage'
import { TemplatesPage } from '../pages/customer/templates/TemplatesPage'
import { RequestSenderPage } from '../pages/customer/sender-ids/RequestSenderPage'
import { SenderIdsPage } from '../pages/customer/sender-ids/SenderIdsPage'
import { ScheduledSmsPage } from '../pages/customer/scheduled/ScheduledSmsPage'
import { TopUpPage } from '../pages/customer/wallet/TopUpPage'
import { WalletPage } from '../pages/customer/wallet/WalletPage'
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
          { path: 'profile', element: <ProfilePage /> },
          { path: 'campaigns', element: <CampaignsPage /> },
          { path: 'campaigns/new', element: <NewCampaignPage /> },
          { path: 'campaigns/:campaignId', element: <CampaignDetailPage /> },
          { path: 'templates', element: <TemplatesPage /> },
          { path: 'sender-ids', element: <SenderIdsPage /> },
          { path: 'sender-ids/new', element: <RequestSenderPage /> },
          { path: 'scheduled', element: <ScheduledSmsPage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'messages/new', element: <NewMessagePage /> },
          { path: 'messages/:messageId', element: <MessageDetailPage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'wallet/top-up', element: <TopUpPage /> },
        ],
      },
    ],
  },
  {
    element: <SiteLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
])
