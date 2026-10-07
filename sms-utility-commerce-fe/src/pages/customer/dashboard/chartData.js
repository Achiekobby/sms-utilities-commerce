// March daily shape from the dashboard reference. `delivered` follows that day's rate.
const dailyShape = [
  [1, 4800, 91],
  [2, 6200, 92.2],
  [3, 9100, 93.6],
  [4, 11800, 92.8],
  [5, 7200, 92],
  [6, 5400, 92.6],
  [7, 8600, 93.8],
  [8, 10900, 95],
  [9, 12400, 95.6],
  [10, 14100, 96],
  [11, 11800, 95.4],
  [12, 13200, 96.2],
  [13, 12600, 95],
  [14, 14800, 94.4],
  [15, 13900, 95.2],
  [16, 16200, 95.8],
  [17, 17100, 96.6],
  [18, 15200, 95.4],
  [19, 11800, 94.8],
  [20, 4600, 94.2],
  [21, 8200, 95],
  [22, 9800, 95.6],
  [23, 11200, 96.4],
  [24, 13400, 97],
  [25, 12800, 96.6],
  [26, 14100, 97.4],
  [27, 13600, 96.8],
  [28, 14800, 97.6],
  [29, 13900, 97.2],
  [30, 15200, 97.8],
  [31, 15800, 98.1],
]

export const dailyVolume = dailyShape.map(([day, sent, rate]) => ({
  label: `Mar ${day}`,
  sent,
  delivered: Math.round((sent * rate) / 100),
  rate,
}))

const dailyTicks = ['Mar 1', 'Mar 5', 'Mar 10', 'Mar 15', 'Mar 20', 'Mar 25', 'Mar 31']

function bucket(size, labelFor) {
  const groups = []
  for (let index = 0; index < dailyVolume.length; index += size) {
    const slice = dailyVolume.slice(index, index + size)
    const sent = slice.reduce((sum, row) => sum + row.sent, 0)
    const delivered = slice.reduce((sum, row) => sum + row.delivered, 0)
    groups.push({
      label: labelFor(slice, groups.length),
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
  { id: 'monthly', label: 'Monthly' },
]

export function volumeSeries(period) {
  if (period === 'weekly') {
    const data = bucket(7, (slice) => slice[0].label)
    return { data, ticks: data.map((row) => row.label) }
  }
  if (period === 'monthly') {
    const data = bucket(31, () => 'March')
    return { data, ticks: ['March'] }
  }
  return { data: dailyVolume, ticks: dailyTicks }
}

// Left axis stays 0–20K on the daily chart. Wider buckets scale up so bars are not clipped.
export function volumeAxis(data) {
  const peak = Math.max(...data.map((row) => row.sent))
  if (peak <= 20000) return { domain: [0, 20000], ticks: [0, 5000, 10000, 15000, 20000] }

  const top = Math.ceil(peak / 20000) * 20000
  const ticks = []
  for (let value = 0; value <= top; value += top / 4) ticks.push(value)
  return { domain: [0, top], ticks }
}

export const sentColor = '#3B82F6'
export const deliveredColor = '#93C5FD'
export const rateColor = '#22C55E'

// Counts sum to 245,892. Shares match the reference legend.
export const deliveryStatus = [
  { label: 'Delivered', value: 241876, share: '98.4%', color: '#22C55E' },
  { label: 'Pending', value: 2314, share: '0.9%', color: '#3B82F6' },
  { label: 'Failed', value: 1211, share: '0.5%', color: '#F5B942' },
  { label: 'Expired', value: 491, share: '0.2%', color: '#C5CED9' },
]

export const deliveryTotal = deliveryStatus.reduce((sum, item) => sum + item.value, 0)
