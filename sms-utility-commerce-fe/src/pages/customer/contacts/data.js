import {
  RiBarChartFill,
  RiContactsBookFill,
  RiFileList2Fill,
  RiGroupFill,
  RiInboxArchiveFill,
  RiMegaphoneFill,
  RiStarFill,
  RiUserAddFill,
  RiUserFill,
  RiVipCrownFill,
} from 'react-icons/ri'

// Illustrative groups matching the contacts reference. `color` is the icon, `tint` the pale tile.
export const groups = [
  {
    id: 'promo-subscribers',
    name: 'Promo Subscribers',
    description: 'Contacts who opted in for promotional SMS campaigns',
    tag: 'Promo',
    breakdown: { active: 7980, pending: 210, unsubscribed: 156, blocked: 75 },
    count: 8421,
    updated: '2024-03-30',
    icon: RiMegaphoneFill,
    color: '#0B63F6',
    tint: '#E3EFFD',
  },
  {
    id: 'utility-users',
    name: 'Utility Users',
    description: 'Users of utility-related services',
    tag: 'Utility',
    breakdown: { active: 5890, pending: 240, unsubscribed: 130, blocked: 60 },
    count: 6320,
    updated: '2024-03-28',
    icon: RiFileList2Fill,
    color: '#008859',
    tint: '#DDF3E6',
  },
  {
    id: 'survey-respondents',
    name: 'Survey Respondents',
    description: 'Contacts who completed surveys',
    tag: 'Survey',
    breakdown: { active: 3900, pending: 180, unsubscribed: 95, blocked: 40 },
    count: 4215,
    updated: '2024-03-26',
    icon: RiBarChartFill,
    color: '#8B3FE0',
    tint: '#EEE3FB',
  },
  {
    id: 'high-value',
    name: 'High Value',
    description: 'High value customers',
    tag: 'High Value',
    breakdown: { active: 2760, pending: 40, unsubscribed: 30, blocked: 10 },
    count: 2840,
    updated: '2024-03-24',
    icon: RiStarFill,
    color: '#E0287D',
    tint: '#FCE0EC',
  },
  {
    id: 'new-signups',
    name: 'New Signups',
    description: 'Recently registered users',
    tag: 'New',
    breakdown: { active: 2100, pending: 290, unsubscribed: 60, blocked: 30 },
    count: 2480,
    updated: '2024-03-20',
    icon: RiUserFill,
    color: '#0B63F6',
    tint: '#E3EFFD',
  },
  {
    id: 'vip-customers',
    name: 'VIP Customers',
    description: 'VIP and priority customers',
    tag: 'VIP',
    breakdown: { active: 604, pending: 4, unsubscribed: 6, blocked: 2 },
    count: 616,
    updated: '2024-03-18',
    icon: RiVipCrownFill,
    color: '#F26B1D',
    tint: '#FFE8D8',
  },
]

export const groupSorts = [
  { id: 'count', label: 'Most Contacts' },
  { id: 'updated', label: 'Recently Updated' },
  { id: 'name', label: 'Name (A–Z)' },
]

// The four summary cards. The figures come from GET /api/client/contact-groups/stats; only the look lives here.
// `color` is the icon, `tint` is the pale tile behind it, and `key` is the field of the stats object it shows.
export const contactStats = [
  { key: 'totalGroups', label: 'Total Groups', icon: RiGroupFill, color: '#0B63F6', tint: '#E3EFFD' },
  { key: 'totalContacts', label: 'Total Contacts', icon: RiContactsBookFill, color: '#0B63F6', tint: '#E3EFFD' },
  { key: 'newThisMonth', label: 'New This Month', icon: RiUserAddFill, color: '#8B3FE0', tint: '#EEE3FB' },
  { key: 'archivedGroups', label: 'Archived', icon: RiInboxArchiveFill, color: '#B45F06', tint: '#FFEBCB' },
]
