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
        summary: 'A record of admin and account activity will be listed here.',
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
        to: paths.clients,
        icon: Users,
        permissions: ['client.manage'],
        summary: 'Client accounts will be managed here.',
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        to: paths.subscriptions,
        icon: BadgeCheck,
        permissions: ['subscription.view', 'subscription.assign'],
        summary: 'Client subscriptions will be reviewed and assigned here.',
      },
      {
        id: 'onboarding',
        label: 'Onboarding',
        icon: UserPlus,
        children: [
          {
            id: 'client-onboarding',
            label: 'Client onboarding',
            to: paths.clientOnboarding,
            icon: UserPlus,
            permissions: ['onboarding.client'],
            summary: 'Client onboarding will be handled here.',
          },
          {
            id: 'admin-onboarding',
            label: 'Admin onboarding',
            to: paths.adminOnboarding,
            icon: ShieldCheck,
            permissions: ['onboarding.admin'],
            summary: 'New admin accounts will be onboarded here.',
          },
        ],
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
        summary: 'Subscription plans will be managed here.',
      },
      {
        id: 'payment-gateways',
        label: 'Payment gateways',
        to: paths.paymentGateways,
        icon: Landmark,
        permissions: ['payment_gateway.manage'],
        summary: 'Payment gateway connections will be managed here.',
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
        to: paths.admins,
        icon: ShieldCheck,
        permissions: ['admin.manage'],
        summary: 'Admin accounts will be managed here.',
      },
      {
        id: 'roles',
        label: 'Roles',
        to: paths.roles,
        icon: Shield,
        permissions: ['role.manage'],
        summary: 'Admin roles will be managed here.',
      },
      {
        id: 'permissions',
        label: 'Permissions',
        to: paths.permissions,
        icon: LockKeyhole,
        permissions: ['permission.manage'],
        summary: 'Permission definitions will be managed here.',
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
  const match = flattenNavigation([...navigation, { id: 'account', items: footerItems }]).find(
    (item) => item.to === pathname,
  )
  return match?.label ?? 'Admin'
}
