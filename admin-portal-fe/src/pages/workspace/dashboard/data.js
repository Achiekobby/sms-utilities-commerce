import { BadgeCheck, CreditCard, Send, Users } from 'lucide-react'

// Sample platform figures for the admin overview until live reports are connected.

export const sentColor = '#3B82F6'
export const deliveredColor = '#93C5FD'
export const rateColor = '#22C55E'

const count = new Intl.NumberFormat('en-GH')
const cedi = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 })

export const formatCount = (value) => count.format(value)
export const formatCedi = (value) => cedi.format(value).replace('GHS', 'GH₵').replace(/\s/g, '')

export function greeting(date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export const metrics = [
  {
    label: 'Active clients',
    value: '186',
    change: 8.4,
    icon: Users,
    color: '#062047',
    tint: '#D6E4FA',
  },
  {
    label: 'Messages sent',
    value: '1,284,620',
    change: 12.6,
    icon: Send,
    color: '#008859',
    tint: '#C8F3DE',
  },
  {
    label: 'Collections',
    value: '482,350',
    prefix: 'GH₵',
    change: 6.1,
    icon: CreditCard,
    color: '#0B63F6',
    tint: '#D6E6FF',
  },
  {
    label: 'Sender IDs in review',
    value: '14',
    change: -18,
    icon: BadgeCheck,
    color: '#B45F06',
    tint: '#FFF4DF',
  },
]

export const collections = {
  total: 482350,
  note: 'Wallet top-ups settled this month.',
  recent: [
    { id: 'top-1', client: 'Akosua Retail', detail: 'MTN wallet top-up', when: '5 Nov 2026', amount: 2500 },
    { id: 'top-2', client: 'Harbour Clinic', detail: 'Telecel wallet top-up', when: '5 Nov 2026', amount: 800 },
  ],
}

const dailyShape = [
  ['5 Oct', 86400, 96.4],
  ['6 Oct', 91200, 96.8],
  ['7 Oct', 94800, 97.1],
  ['8 Oct', 102400, 96.6],
  ['9 Oct', 110200, 97.4],
  ['10 Oct', 74200, 96.2],
  ['11 Oct', 68800, 95.8],
  ['12 Oct', 99600, 97.0],
  ['13 Oct', 108800, 97.5],
  ['14 Oct', 116400, 97.8],
  ['15 Oct', 121000, 97.2],
  ['16 Oct', 113600, 96.9],
  ['17 Oct', 80400, 96.1],
  ['18 Oct', 76800, 95.9],
]

export const dailyVolume = dailyShape.map(([label, sent, rate]) => ({
  label,
  sent,
  delivered: Math.round((sent * rate) / 100),
  rate,
}))

function bucket(size) {
  const groups = []
  for (let index = 0; index < dailyVolume.length; index += size) {
    const slice = dailyVolume.slice(index, index + size)
    const sent = slice.reduce((sum, row) => sum + row.sent, 0)
    const delivered = slice.reduce((sum, row) => sum + row.delivered, 0)
    groups.push({
      label: slice[0].label,
      sent,
      delivered,
      rate: Math.round((delivered / sent) * 1000) / 10,
    })
  }
  return groups
}

export const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
]

export function volumeSeries(period) {
  if (period === 'weekly') {
    const data = bucket(7)
    return { data, ticks: data.map((row) => row.label) }
  }
  return { data: dailyVolume, ticks: ['5 Oct', '8 Oct', '11 Oct', '14 Oct', '18 Oct'] }
}

export function volumeAxis(data) {
  const peak = Math.max(...data.map((row) => row.sent))
  const top = Math.ceil(peak / 40000) * 40000
  const ticks = []
  for (let value = 0; value <= top; value += top / 4) ticks.push(value)
  return { domain: [0, top], ticks }
}

export const deliveryStatus = [
  { label: 'Delivered', value: 1261840, share: '98.2%', color: '#22C55E' },
  { label: 'Pending', value: 12840, share: '1.0%', color: '#3B82F6' },
  { label: 'Failed', value: 6420, share: '0.5%', color: '#F5B942' },
  { label: 'Rejected', value: 3520, share: '0.3%', color: '#E11D48' },
]

export const deliveryTotal = deliveryStatus.reduce((sum, item) => sum + item.value, 0)

export const reviewQueue = [
  { id: 'sid-1', title: 'CELLOMART', detail: 'Akosua Retail · sender ID', status: 'Pending' },
  { id: 'sid-2', title: 'HARBOUR', detail: 'Harbour Clinic · sender ID', status: 'Pending' },
  { id: 'ob-1', title: 'Northwind Stores', detail: 'Client onboarding', status: 'New' },
  { id: 'pay-1', title: 'GH₵ 4,200 top-up', detail: 'Kente & Co · payment review', status: 'Review' },
]

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const yearlyViews = [
  { id: 'payments', label: 'Payments', detail: 'Wallet collections settled each month.' },
  { id: 'subscriptions', label: 'Subscriptions', detail: 'New plans started each month.' },
]

export const yearlyReports = {
  2026: {
    payments: [286400, 312800, 428600, 364200, 391500, 348900, 372400, 405200, 468800, 512400, 486350, 392100],
    subscriptions: [34, 29, 48, 41, 37, 33, 39, 44, 52, 58, 47, 36],
  },
  2025: {
    payments: [214600, 238400, 301200, 276800, 289400, 264100, 281600, 318900, 346200, 372800, 358400, 301500],
    subscriptions: [28, 24, 36, 31, 30, 27, 32, 35, 40, 43, 38, 29],
  },
  2024: {
    payments: [162400, 174800, 221600, 198400, 206900, 188200, 194600, 228400, 246800, 268100, 251400, 214700],
    subscriptions: [18, 16, 22, 20, 19, 17, 21, 24, 26, 28, 23, 19],
  },
}

export const yearlyYears = Object.keys(yearlyReports)
  .map(Number)
  .sort((left, right) => right - left)

export function yearlySeries(year, view) {
  const values = yearlyReports[year]?.[view] ?? []
  return monthLabels.map((label, index) => ({ label, value: values[index] ?? 0 }))
}

export const recentActivity = [
  { id: 'a1', client: 'Akosua Retail', event: 'Wallet top-up', detail: 'GH₵ 2,500 · MTN', when: '5 Nov, 09:14', status: 'Settled' },
  { id: 'a2', client: 'Harbour Clinic', event: 'Sender ID', detail: 'HARBOUR submitted', when: '5 Nov, 08:02', status: 'Pending' },
  { id: 'a3', client: 'Kente & Co', event: 'Campaign', detail: '128,400 messages', when: '4 Nov, 18:40', status: 'Sent' },
  { id: 'a4', client: 'Northwind Stores', event: 'Onboarding', detail: 'Profile submitted', when: '4 Nov, 16:11', status: 'New' },
  { id: 'a5', client: 'Gold Coast Bank', event: 'Sender ID', detail: 'GCBALERT approved', when: '4 Nov, 11:26', status: 'Approved' },
]
