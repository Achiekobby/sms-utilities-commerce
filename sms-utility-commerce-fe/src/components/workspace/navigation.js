import {
  CalendarClock,
  ChartColumn,
  ClipboardList,
  Code,
  FileText,
  Gift,
  IdCard,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Package,
  Receipt,
  ScrollText,
  Settings,
  ShoppingBag,
  Smartphone,
  UserRound,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { paths } from '../../routes/paths'

// An item without `to` is a module that is planned but not built yet.
// It renders muted and is not focusable until its page exists.
// `keywords` only feed the global search.
export function getNavigation({ isBusiness }) {
  return [
    {
      id: 'overview',
      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          to: paths.dashboard,
          keywords: 'home overview summary',
        },
      ],
    },
    {
      id: 'messaging',
      label: 'Messaging',
      items: [
        {
          label: 'Contacts',
          icon: Users,
          to: paths.contacts,
          keywords: 'groups upload numbers birthdays',
        },
        {
          label: 'Campaigns',
          icon: Megaphone,
          to: paths.campaigns,
          keywords: 'bulk sms send blast create',
        },
        {
          label: 'Messages',
          icon: MessageSquare,
          to: paths.messages,
          keywords: 'numbers groups send report direct',
        },
        {
          label: 'Scheduled',
          icon: CalendarClock,
          to: paths.scheduled,
          keywords: 'schedule later queue waiting send time',
        },
        {
          label: 'Templates',
          icon: FileText,
          to: paths.templates,
          keywords: 'saved message personalize',
        },
        {
          label: 'Sender IDs',
          icon: IdCard,
          to: paths.senderIds,
          keywords: 'sender name brand approve reject pending',
        },
      ],
    },
    {
      id: 'payments',
      label: 'Payments',
      items: [
        {
          label: 'Wallet',
          icon: Wallet,
          to: paths.wallet,
          keywords: 'fund balance momo card top up payments hubtel paystack',
        },
        {
          label: 'Plans',
          icon: Package,
          to: paths.plans,
          keywords: 'pricing packages subscribe subscription units sms plans billing',
        },
        {
          label: 'Payments',
          icon: Receipt,
          to: paths.payments,
          keywords: 'payment history checkout momo card paystack transactions receipts',
        },
        {
          label: 'Orders',
          icon: ShoppingBag,
          to: paths.orders,
          keywords: 'orders purchases packages plans sms units order history',
        },
        {
          label: 'Utilities',
          icon: Smartphone,
          keywords: 'airtime data tv electricity water bills buy',
        },
      ],
    },

    {
      id: 'engagement',
      label: 'Engagement',
      items: [
        { label: 'Rewards', icon: Gift, keywords: 'airtime data money earn promotions' },
        { label: 'Surveys', icon: ClipboardList, keywords: 'questions responses' },
        { label: 'Analytics', icon: ChartColumn, keywords: 'reports usage results charts' },
      ],
    },
    {
      id: 'developers',
      label: 'Developers',
      items: [
        {
          label: 'API Key',
          icon: Code,
          to: paths.apiKeys,
          keywords: 'developer portal api keys credentials token regenerate sms api',
        },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        ...(isBusiness ? [{ label: 'Team', icon: UsersRound, keywords: 'members roles invite' }] : []),
        {
          label: 'Activity logs',
          icon: ScrollText,
          to: paths.activityLogs,
          keywords: 'audit history events security otp profile subscription',
        },
        {
          label: 'Settings',
          icon: Settings,
          to: paths.profile,
          keywords: 'preferences security notifications',
        },
      ],
    },
  ]
}

// The account dropdown: who you are, where you manage it, and how you leave.
export function getAccountMenu() {
  return [
    [
      { label: 'Profile', icon: UserRound, to: paths.profile },
      { label: 'Settings', icon: Settings },
    ],
    [{ label: 'API Key', icon: Code, to: paths.apiKeys }],
  ]
}

// Everything the global search can jump to.
export function getSearchEntries({ isBusiness }) {
  const pages = getNavigation({ isBusiness }).flatMap((group) =>
    group.items.map((item) => ({
      label: item.label,
      icon: item.icon,
      to: item.to,
      group: group.label ?? 'Overview',
      keywords: item.keywords ?? '',
    })),
  )

  return [
    ...pages,
    {
      label: 'Profile',
      icon: UserRound,
      to: paths.profile,
      group: 'Account',
      keywords: 'name email phone details',
    },
  ]
}
