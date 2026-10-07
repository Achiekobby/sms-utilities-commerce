// Local-time YYYY-MM-DD, so "today" is the user's today and not UTC's.
export function toISODate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const daysBack = (today, days) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)

// `compare` is what the trend figures on the cards are measured against for that range.
export const presets = [
  {
    id: 'this-month',
    label: 'This month',
    compare: 'vs last month',
    resolve: (t) => ({
      from: new Date(t.getFullYear(), t.getMonth(), 1),
      to: new Date(t.getFullYear(), t.getMonth() + 1, 0),
    }),
  },
  {
    id: 'last-month',
    label: 'Last month',
    compare: 'vs prior month',
    resolve: (t) => ({
      from: new Date(t.getFullYear(), t.getMonth() - 1, 1),
      to: new Date(t.getFullYear(), t.getMonth(), 0),
    }),
  },
  {
    id: 'last-7',
    label: 'Last 7 days',
    compare: 'vs previous 7 days',
    resolve: (t) => ({ from: daysBack(t, 6), to: t }),
  },
  {
    id: 'last-30',
    label: 'Last 30 days',
    compare: 'vs previous 30 days',
    resolve: (t) => ({ from: daysBack(t, 29), to: t }),
  },
  {
    id: 'last-90',
    label: 'Last 90 days',
    compare: 'vs previous 90 days',
    resolve: (t) => ({ from: daysBack(t, 89), to: t }),
  },
  {
    id: 'this-year',
    label: 'This year',
    compare: 'vs last year',
    resolve: (t) => ({ from: new Date(t.getFullYear(), 0, 1), to: t }),
  },
]

export function getPresetRange(id, today = new Date()) {
  const preset = presets.find((item) => item.id === id) ?? presets[0]
  const { from, to } = preset.resolve(today)
  return { id: preset.id, from: toISODate(from), to: toISODate(to), compare: preset.compare }
}

export function getCustomRange(from, to) {
  return { id: 'custom', from, to, compare: 'vs previous period' }
}
