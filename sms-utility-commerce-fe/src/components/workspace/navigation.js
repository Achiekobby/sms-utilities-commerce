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
  Settings,
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
        { label: 'Campaigns', icon: Megaphone, keywords: 'bulk sms send blast' },
        { label: 'Messages', icon: MessageSquare, keywords: 'sms inbox sent delivery' },
        { label: 'Scheduled', icon: CalendarClock, keywords: 'schedule later queue' },
        { label: 'Templates', icon: FileText, keywords: 'saved message personalize' },
        { label: 'Sender IDs', icon: IdCard, keywords: 'sender name brand' },
      ],
    },
    {
      id: 'payments',
      label: 'Payments',
      items: [
        { label: 'Wallet', icon: Wallet, keywords: 'fund balance momo card top up payments' },
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
          label: 'API access',
          icon: Code,
          keywords: 'developer portal api keys credentials webhooks docs',
        },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        ...(isBusiness ? [{ label: 'Team', icon: UsersRound, keywords: 'members roles invite' }] : []),
        { label: 'Settings', icon: Settings, keywords: 'preferences security notifications' },
      ],
    },
  ]
}

// The account dropdown: who you are, where you manage it, and how you leave.
export function getAccountMenu() {
  return [
    [
      { label: 'Profile', icon: UserRound },
      { label: 'Settings', icon: Settings },
    ],
    [{ label: 'Developer portal', icon: Code }],
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
      group: 'Account',
      keywords: 'name email phone details',
    },
  ]
}
