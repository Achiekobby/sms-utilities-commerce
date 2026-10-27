import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RiBookmarkFill, RiGroupFill, RiHeartFill, RiPriceTag3Fill, RiStarFill } from 'react-icons/ri'
import { groups as seededGroups } from './data'

// Groups the user creates cycle through these looks so each one is easy to tell apart.
const looks = [
  { icon: RiGroupFill, color: '#0B63F6', tint: '#E3EFFD' },
  { icon: RiBookmarkFill, color: '#8B3FE0', tint: '#EEE3FB' },
  { icon: RiPriceTag3Fill, color: '#008859', tint: '#DDF3E6' },
  { icon: RiHeartFill, color: '#E0287D', tint: '#FCE0EC' },
  { icon: RiStarFill, color: '#F26B1D', tint: '#FFE8D8' },
]

function hash(text) {
  let value = 0
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) >>> 0
  }
  return value
}

function fromCreated(entry) {
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description || 'No description yet',
    tag: entry.name.length > 14 ? `${entry.name.slice(0, 13)}…` : entry.name,
    breakdown: { active: 0, pending: 0, unsubscribed: 0, blocked: 0 },
    count: 0,
    updated: entry.createdAt,
    ...looks[hash(entry.id) % looks.length],
  }
}

function withImport(group, imported) {
  if (!imported?.added) return group

  return {
    ...group,
    count: group.count + imported.added,
    breakdown: { ...group.breakdown, active: group.breakdown.active + imported.added },
    updated: imported.at,
  }
}

// Every group the user can see: the ones they created (newest first) followed by the sample groups,
// each with any contacts imported since.
export function useGroups() {
  const created = useSelector((state) => state.contacts.created)
  const imported = useSelector((state) => state.contacts.imported)

  return useMemo(
    () => [...created.map(fromCreated), ...seededGroups].map((group) => withImport(group, imported[group.id])),
    [created, imported],
  )
}
