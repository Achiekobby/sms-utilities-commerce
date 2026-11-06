import {
  BadgeCheck,
  ChartColumn,
  CircleCheck,
  CreditCard,
  IdCard,
  Key,
  KeyRound,
  Landmark,
  Layers,
  LayoutDashboard,
  LockKeyhole,
  MessageSquare,
  Package,
  Radio,
  ScrollText,
  Send,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { filterNavigation, flattenNavigation } from '../../features/auth/permissions'
import { paths } from '../../routes/paths'

const navigation = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: paths.app,
        icon: LayoutDashboard,
        summary: 'Your admin home.',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'orders',
        label: 'Orders',
        to: paths.orders,
        icon: Package,
        permissions: ['order.view'],
        summary: 'Orders placed across the platform will be listed here.',
      },
      {
        id: 'reports',
        label: 'Reports',
        to: paths.reports,
        icon: ChartColumn,
        permissions: ['report.view', 'report.export'],
        summary: 'Delivery and account reports will be available here.',
      },
      {
        id: 'activity-logs',
        label: 'Activity logs',
        to: paths.activityLogs,
        icon: ScrollText,
        permissions: ['activity_log.view'],
        summary: 'Admin, client, and system activity across the platform.',
      },
    ],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    items: [
      {
        id: 'sms',
        label: 'SMS',
        icon: MessageSquare,
        children: [
          {
            id: 'sms-overview',
            label: 'SMS overview',
            to: paths.sms,
            icon: MessageSquare,
            permissions: ['sms.view'],
            summary: 'SMS traffic and delivery status will be shown here.',
          },
          {
            id: 'sms-send',
            label: 'Send SMS',
            to: paths.smsSend,
            icon: Send,
            permissions: ['sms.send'],
            summary: 'Sending tools for admin operators will live here.',
          },
          {
            id: 'sms-aggregators',
            label: 'Aggregators',
            to: paths.smsAggregators,
            icon: Radio,
            permissions: ['sms.aggregator'],
            summary: 'SMS aggregator connections will be managed here.',
          },
        ],
      },
      {
        id: 'sender-ids',
        label: 'Sender IDs',
        to: paths.senderIds,
        icon: IdCard,
        permissions: ['sender_id.view', 'sender_id.approve', 'sender_id.blacklist'],
        summary: 'Sender name requests, approvals, and blocks will be handled here.',
      },
      {
        id: 'api-keys',
        label: 'API keys',
        to: paths.apiKeys,
        icon: Key,
        permissions: ['api_key.manage'],
        summary: 'Client API credentials will be managed here.',
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    items: [
      {
        id: 'clients',
        label: 'Clients',
        icon: Users,
        children: [
          {
            id: 'all-clients',
            label: 'All clients',
            to: paths.clients,
            icon: Users,
            permissions: ['client.manage'],
            summary: 'Individual and business accounts, with wallet and subscription status.',
          },
          {
            id: 'client-onboarding',
            label: 'Client onboarding',
            to: paths.clientOnboarding,
            icon: UserPlus,
            permissions: ['onboarding.client'],
            summary: 'Create an individual or business client and email them a sign-in code.',
          },
        ],
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        to: paths.subscriptions,
        icon: BadgeCheck,
        permissions: ['subscription.view', 'subscription.assign'],
        summary: 'Active plans, credit top-ups, and subscription history.',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      {
        id: 'wallets',
        label: 'Wallets',
        to: paths.wallets,
        icon: Wallet,
        permissions: ['wallet.view'],
        summary: 'Client wallet balances will be shown here.',
      },
      {
        id: 'payments',
        label: 'Payments',
        to: paths.payments,
        icon: CreditCard,
        permissions: ['payment.view', 'payment.manage'],
        summary: 'Payment records will be listed here.',
      },
      {
        id: 'plans',
        label: 'Plans',
        to: paths.plans,
        icon: Layers,
        permissions: ['plan.manage'],
        summary: 'Subscription plans, prices, and SMS units.',
      },
      {
        id: 'payment-gateways',
        label: 'Payment gateways',
        to: paths.paymentGateways,
        icon: Landmark,
        permissions: ['payment_gateway.manage'],
        summary: 'Enable providers, set priority, and choose the primary gateway.',
      },
      {
        id: 'payment-settings',
        label: 'Payment settings',
        to: paths.paymentSettings,
        icon: SlidersHorizontal,
        permissions: ['payment_settings.manage'],
        summary: 'Payment configuration will be managed here.',
      },
    ],
  },
  {
    id: 'access',
    label: 'Access & security',
    items: [
      {
        id: 'admins',
        label: 'Admins',
        icon: ShieldCheck,
        children: [
          {
            id: 'all-admins',
            label: 'All admins',
            to: paths.admins,
            icon: ShieldCheck,
            permissions: ['admin.manage'],
            summary: 'Team members, their roles, and account status.',
          },
          {
            id: 'admin-onboarding',
            label: 'Admin onboarding',
            to: paths.adminOnboarding,
            icon: UserPlus,
            permissions: ['onboarding.admin'],
            summary: 'Create an admin, assign a role, and email them a sign-in code.',
          },
        ],
      },
      {
        id: 'roles',
        label: 'Roles',
        to: paths.roles,
        icon: Shield,
        permissions: ['role.manage'],
        summary: 'Roles and the permissions each one can use.',
      },
      {
        id: 'permissions',
        label: 'Permissions',
        to: paths.permissions,
        icon: LockKeyhole,
        permissions: ['permission.manage'],
        summary: 'Every permission, grouped by the part of the platform it covers.',
      },
      {
        id: 'otp',
        label: 'OTP',
        to: paths.otp,
        icon: KeyRound,
        permissions: ['otp.manage'],
        summary: 'One-time code settings will be managed here.',
      },
      {
        id: 'account-status',
        label: 'Account status',
        to: paths.accountStatus,
        icon: CircleCheck,
        permissions: ['account_status.manage'],
        summary: 'Account status controls will be managed here.',
      },
    ],
  },
]

const readyPaths = new Set([
  paths.app,
  paths.clients,
  paths.clientOnboarding,
  paths.senderIds,
  paths.plans,
  paths.activityLogs,
  paths.subscriptions,
  paths.paymentGateways,
  paths.roles,
  paths.permissions,
  paths.admins,
  paths.adminOnboarding,
  paths.profile,
])

export function isComingSoon(to) {
  return Boolean(to) && !readyPaths.has(to)
}

const footerItems = [
  {
    id: 'profile',
    label: 'Profile',
    to: paths.profile,
    icon: UserRound,
    permissions: ['profile.manage'],
    summary: 'Your admin profile will be updated here.',
  },
]

export function getAdminNavigation(access) {
  return filterNavigation(navigation, access)
}

export function getFooterNavigation(access) {
  return filterNavigation([{ id: 'account', items: footerItems }], access)[0]?.items ?? []
}

export function getGuardedRoutes() {
  return flattenNavigation([...navigation, { id: 'account', items: footerItems }]).filter(
    (item) => item.to && item.to !== paths.app && item.permissions?.length,
  )
}

export function getSearchEntries(access) {
  const pages = getAdminNavigation(access).flatMap((group) =>
    group.items.flatMap((item) => {
      const links = item.children ?? [item]
      return links
        .filter((link) => link.to)
        .map((link) => ({
          id: link.id,
          label: link.label,
          to: link.to,
          icon: link.icon,
          group: group.label,
          summary: link.summary ?? '',
          comingSoon: isComingSoon(link.to),
        }))
    }),
  )

  const account = getFooterNavigation(access).map((item) => ({
    id: item.id,
    label: item.label,
    to: item.to,
    icon: item.icon,
    group: 'Account',
    summary: item.summary ?? '',
    comingSoon: isComingSoon(item.to),
  }))

  return [...pages, ...account]
}

export function matchSearchEntries(entries, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return entries
  return entries.filter((entry) =>
    `${entry.label} ${entry.group} ${entry.summary}`.toLowerCase().includes(needle),
  )
}

export function titleForPath(pathname) {
  if (pathname.startsWith(`${paths.clients}/`)) return 'Client'
  const match = flattenNavigation([...navigation, { id: 'account', items: footerItems }]).find(
    (item) => item.to === pathname,
  )
  return match?.label ?? 'Admin'
}
