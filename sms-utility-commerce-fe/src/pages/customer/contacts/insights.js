import { RiDatabase2Fill, RiPriceTag3Fill, RiSendPlaneFill, RiUploadCloud2Fill, RiUserAddFill } from 'react-icons/ri'
import { formatCount } from '../dashboard/format'

// Status colours shared by the donut and its legend.
export const insightStatuses = [
  { key: 'active', label: 'Active', color: '#008859' },
  { key: 'pending', label: 'Pending', color: '#F5A70B' },
  { key: 'unsubscribed', label: 'Unsubscribed', color: '#F27BAA' },
  { key: 'blocked', label: 'Blocked', color: '#E5384F' },
]

const roundTo = (value, step) => Math.round(value / step) * step

// Illustrative activity until the contacts API is connected. Figures are derived from the group's
// own size, so every group reads plausibly (Promo Subscribers matches the reference exactly).
export function getGroupActivity(group) {
  const imported = roundTo(group.count * 0.15, 50)
  const added = roundTo(group.count * 0.038, 10)
  const duplicates = Math.round(group.count * 0.0053)
  const reached = group.breakdown.active - 30

  return [
    {
      id: 'import',
      title: `Imported ${formatCount(imported)} contacts`,
      detail: `From "Q1_${group.tag.replace(/\s+/g, '')}_2024.csv"`,
      when: '2 hours ago',
      icon: RiUploadCloud2Fill,
      color: '#008859',
      tint: '#DDF3E6',
      dot: '#0B63F6',
    },
    {
      id: 'members',
      title: `Added ${formatCount(added)} members`,
      detail: 'Via signup form',
      when: '5 hours ago',
      icon: RiUserAddFill,
      color: '#0B63F6',
      tint: '#E3EFFD',
      dot: '#0B63F6',
    },
    {
      id: 'campaign',
      title: 'Sent campaign “Spring Sale”',
      detail: `To ${formatCount(reached)} contacts`,
      when: '1 day ago',
      icon: RiSendPlaneFill,
      color: '#8B3FE0',
      tint: '#EEE3FB',
      dot: '#0B63F6',
    },
    {
      id: 'duplicates',
      title: `Removed ${formatCount(duplicates)} duplicates`,
      detail: 'Automatically merged contacts',
      when: '2 days ago',
      icon: RiDatabase2Fill,
      color: '#F26B1D',
      tint: '#FFE8D8',
      dot: '#F5841F',
    },
    {
      id: 'tags',
      title: 'Updated group tags',
      detail: `Added "${group.tag}" tag to ${formatCount(added)} contacts`,
      when: '3 days ago',
      icon: RiPriceTag3Fill,
      color: '#E0287D',
      tint: '#FCE0EC',
      dot: '#E0287D',
    },
  ]
}
