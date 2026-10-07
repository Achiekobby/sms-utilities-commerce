import { toISODate } from '../dashboard/dateRanges'
import { parseISODate } from '../dashboard/format'

// Member rows are illustrative until the contacts API is connected. They are generated
// deterministically per group, so every group's status counts match its summary exactly
// and the same group always shows the same people.

// "Today" for the mock activity dates, so the Last Activity filter has something to measure from.
export const dataAsOf = '2024-03-30'

export const statusLabels = {
  active: 'Active',
  pending: 'Pending',
  unsubscribed: 'Unsubscribed',
  blocked: 'Blocked',
}

export const statusOptions = [
  { id: 'all', label: 'All statuses', triggerLabel: 'Status' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'unsubscribed', label: 'Unsubscribed' },
  { id: 'blocked', label: 'Blocked' },
]

const sources = ['Web Form', 'CSV Import', 'API', 'Manual']

export const sourceOptions = [
  { id: 'all', label: 'All sources', triggerLabel: 'Source' },
  ...sources.map((source) => ({ id: source, label: source })),
]

export const activityOptions = [
  { id: 'any', label: 'Any time', triggerLabel: 'Last Activity' },
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: 'Last 30 days' },
  { id: '90', label: 'Last 90 days' },
]

export const sortOptions = [
  { id: 'latest', label: 'Latest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'name-asc', label: 'Name (A–Z)' },
  { id: 'name-desc', label: 'Name (Z–A)' },
]

export const pageSizeOptions = [8, 16, 32, 64].map((size) => ({ id: String(size), label: String(size) }))

const firstNames = [
  'James', 'Maria', 'Daniel', 'Grace', 'Samuel', 'Olivia', 'Kwame', 'Ama', 'Noah', 'Chloe',
  'Ethan', 'Abena', 'Lucas', 'Mia', 'Isaac', 'Esi', 'Henry', 'Zoe', 'Joseph', 'Nina',
  'Adam', 'Ruth', 'Victor', 'Hannah', 'Felix', 'Linda', 'Oscar', 'Naomi', 'Peter', 'Janet',
]

const lastNames = [
  'Mensah', 'Owusu', 'Boateng', 'Asante', 'Adjei', 'Brown', 'Taylor', 'Wilson', 'Clark', 'Lewis',
  'Walker', 'Hall', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Evans', 'Morris', 'Reed', 'Cook',
]

const activities = {
  active: ['Received SMS', 'Opened Campaign', 'Clicked Link', 'Replied to SMS'],
  pending: ['Added to Group', 'Awaiting opt-in'],
  unsubscribed: ['Unsubscribed'],
  blocked: ['Bounced (Hard)', 'Blocked by carrier'],
}

const secondaryTags = ['Engaged', 'New', 'Survey', 'Inactive', 'VIP']

// Transcribed from the group detail reference.
const promoSeed = [
  ['John Doe', '+233 24 123 4567', 'john.doe@example.com', 'active', '2024-03-30', 'Received SMS', 'Engaged'],
  ['Sarah Miller', '+233 55 987 6543', 'sarah.miller@example.com', 'active', '2024-03-29', 'Opened Campaign', 'New'],
  ['Robert Johnson', '+233 20 456 7890', 'robert.j@example.com', 'pending', '2024-03-28', 'Added to Group', 'Survey'],
  ['Emily Parker', '+233 54 234 5678', 'emily.parker@example.com', 'active', '2024-03-26', 'Clicked Link', 'Engaged'],
  ['Lisa Anderson', '+233 26 345 6789', 'lisa.anderson@example.com', 'unsubscribed', '2024-03-24', 'Unsubscribed', 'Inactive'],
  ['David Kim', '+233 27 765 4321', 'david.kim@example.com', 'active', '2024-03-20', 'Received SMS', 'VIP'],
  ['Anna Smith', '+233 50 112 2334', 'anna.smith@example.com', 'active', '2024-03-19', 'Opened Campaign', 'Engaged'],
  ['Michael Chen', '+233 59 876 5432', 'michael.chen@example.com', 'blocked', '2024-03-18', 'Bounced (Hard)', 'New'],
]

// Ghana mobile numbers: +233, a two-digit network prefix (MTN, Telecel, AT), then seven digits.
const ghanaPrefixes = ['24', '54', '55', '59', '25', '53', '20', '50', '27', '57', '26', '56']

function ghanaPhone(random) {
  const rest = String(Math.floor(random() * 10_000_000)).padStart(7, '0')
  return `+233 ${pick(ghanaPrefixes, random)} ${rest.slice(0, 3)} ${rest.slice(3)}`
}

// Lets "024 123 4567", "0241234567" and "+233 24 123 4567" all find the same member.
function phoneDigits(text) {
  const digits = text.replace(/\D/g, '')
  return digits.startsWith('0') ? `233${digits.slice(1)}` : digits
}

function hash(text) {
  let value = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (list, random) => list[Math.floor(random() * list.length)]

function shuffle(list, random) {
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[list[index], list[swap]] = [list[swap], list[index]]
  }
  return list
}

function daysBefore(iso, days) {
  const date = parseISODate(iso)
  date.setDate(date.getDate() - days)
  return toISODate(date)
}

function initialsOf(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function finish(member) {
  return { ...member, initials: initialsOf(member.name), tone: hash(member.name) % 6 }
}

const cache = new Map()

export function getMembers(group) {
  // Keyed by size too, so a group that has just had contacts imported is rebuilt.
  const key = `${group.id}:${group.count}`
  if (cache.has(key)) return cache.get(key)

  const random = seededRandom(hash(group.id))
  const seeded = group.id === 'promo-subscribers' ? promoSeed : []

  const remaining = { ...group.breakdown }
  seeded.forEach((row) => {
    remaining[row[3]] -= 1
  })

  const statuses = shuffle(
    Object.entries(remaining).flatMap(([status, count]) => Array.from({ length: count }, () => status)),
    random,
  )

  const members = seeded.map((row, index) =>
    finish({
      id: `${group.id}-${index}`,
      name: row[0],
      phone: row[1],
      email: row[2],
      status: row[3],
      source: sources[index % sources.length],
      activityDate: row[4],
      activity: row[5],
      tags: [group.tag, row[6]],
    }),
  )

  statuses.forEach((status, step) => {
    const first = pick(firstNames, random)
    const last = pick(lastNames, random)
    const handle = random() < 0.2 ? `${first[0]}${last}` : `${first}.${last}`
    const secondary = status === 'unsubscribed' && random() < 0.7 ? 'Inactive' : pick(secondaryTags, random)

    members.push(
      finish({
        id: `${group.id}-${seeded.length + step}`,
        name: `${first} ${last}`,
        phone: ghanaPhone(random),
        email: `${handle.toLowerCase()}@example.com`,
        status,
        source: pick(sources, random),
        activityDate: daysBefore('2024-03-17', Math.floor(step * 0.11)),
        activity: pick(activities[status], random),
        tags: [group.tag, secondary],
      }),
    )
  })

  cache.set(key, members)
  return members
}

const byName = (a, b) => a.name.localeCompare(b.name)

const sorters = {
  latest: (a, b) => b.activityDate.localeCompare(a.activityDate),
  oldest: (a, b) => a.activityDate.localeCompare(b.activityDate),
  'name-asc': byName,
  'name-desc': (a, b) => byName(b, a),
}

export function queryMembers(members, { status, source, activity, search, sort }) {
  const term = search.trim().toLowerCase()
  const digits = phoneDigits(term)
  const cutoff = activity === 'any' ? null : daysBefore(dataAsOf, Number(activity))

  return members
    .filter((member) => status === 'all' || member.status === status)
    .filter((member) => source === 'all' || member.source === source)
    .filter((member) => !cutoff || member.activityDate >= cutoff)
    .filter(
      (member) =>
        !term ||
        member.name.toLowerCase().includes(term) ||
        member.phone.toLowerCase().includes(term) ||
        (digits.length >= 3 && phoneDigits(member.phone).includes(digits)) ||
        member.email.toLowerCase().includes(term),
    )
    .sort(sorters[sort] ?? sorters.latest)
}
