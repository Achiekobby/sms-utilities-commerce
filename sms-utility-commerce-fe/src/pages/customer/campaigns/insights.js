import { formatStamp } from '../../../features/contacts/contactImport'
import { formatCount } from '../dashboard/format'

function count(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

/** API rates are either a fraction (0.85) or a percent (85). Both read as a percent here. */
export function asPercent(value) {
  const amount = count(value)
  if (amount > 0 && amount <= 1) return amount * 100
  return amount
}

export function analyticsFromApi(data) {
  const source = data && typeof data === 'object' ? data : {}
  return {
    sent: count(source.sent),
    delivered: count(source.delivered),
    failed: count(source.failed),
    clicks: count(source.clicks),
    uniqueClicks: count(source.unique_clicks),
    deliveryRate: asPercent(source.delivery_rate),
    clickRate: asPercent(source.click_rate),
    eligible: count(source.eligible_recipients),
  }
}

export function eventFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null
  const raw = data.created_at
  const createdAt = raw ? String(raw).trim().replace(' ', 'T') : ''
  return {
    id: String(data.id),
    campaignId: data.campaign_id == null ? '' : String(data.campaign_id),
    contactId: data.contact_id == null ? '' : String(data.contact_id),
    phone: String(data.phone ?? ''),
    event: String(data.event ?? '').trim().toLowerCase() || 'unknown',
    inboxId: data.meta?.inbox_id == null ? '' : String(data.meta.inbox_id),
    createdAt,
    when: formatStamp(createdAt) || '—',
  }
}

const eventLabels = {
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
  undelivered: 'Failed',
  click: 'Click',
  clicked: 'Click',
  clicks: 'Click',
  unique_click: 'Unique click',
  unique_clicks: 'Unique click',
}

export function eventLabel(event) {
  const key = String(event ?? '').toLowerCase()
  if (eventLabels[key]) return eventLabels[key]
  if (!key) return 'Event'
  return key.replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase())
}

const eventTones = {
  sent: 'bg-[#E7F1FC] text-blue',
  delivered: 'bg-[#E5F6EC] text-[#008859]',
  failed: 'bg-[#FDECEE] text-[#C21F2D]',
  undelivered: 'bg-[#FDECEE] text-[#C21F2D]',
  click: 'bg-[#F3EEFB] text-[#6D28D9]',
  clicked: 'bg-[#F3EEFB] text-[#6D28D9]',
  clicks: 'bg-[#F3EEFB] text-[#6D28D9]',
  unique_click: 'bg-[#E6F6F8] text-[#0E7490]',
  unique_clicks: 'bg-[#E6F6F8] text-[#0E7490]',
}

export function eventTone(event) {
  return eventTones[String(event ?? '').toLowerCase()] ?? 'bg-[#F3F6FB] text-navy'
}

export const volumeMetrics = [
  { key: 'eligible', label: 'Eligible', color: '#0B1F5B', events: [] },
  { key: 'sent', label: 'Sent', color: '#1473E6', events: ['sent'] },
  { key: 'delivered', label: 'Delivered', color: '#008859', events: ['delivered'] },
  { key: 'failed', label: 'Failed', color: '#E0232E', events: ['failed', 'undelivered'] },
  { key: 'clicks', label: 'Clicks', color: '#7C5CD6', events: ['click', 'clicked', 'clicks'] },
  { key: 'uniqueClicks', label: 'Unique clicks', color: '#0E7490', events: ['unique_click', 'unique_clicks'] },
]

export function volumeRows(stats) {
  return volumeMetrics.map((metric) => ({ ...metric, value: stats[metric.key] ?? 0 }))
}

export function outcomeSlices(stats) {
  const pending = Math.max(0, stats.sent - stats.delivered - stats.failed)
  return [
    { key: 'delivered', label: 'Delivered', value: stats.delivered, color: '#008859', events: ['delivered'] },
    { key: 'failed', label: 'Failed', value: stats.failed, color: '#E0232E', events: ['failed', 'undelivered'] },
    { key: 'pending', label: 'Still sending', value: pending, color: '#E8A317', events: ['sent'] },
  ].filter((slice) => slice.value > 0)
}

export function eventMatches(event, metricKey) {
  const metric = volumeMetrics.find((item) => item.key === metricKey)
  if (!metric?.events.length) return false
  return metric.events.includes(event)
}

export function activityBuckets(events) {
  const buckets = new Map()
  events.forEach((event) => {
    const stamp = event.createdAt.slice(0, 16) || 'Unknown time'
    const bucket = buckets.get(stamp) ?? { stamp, label: event.when, sent: 0, delivered: 0, failed: 0, clicks: 0, other: 0 }
    if (event.event === 'sent') bucket.sent += 1
    else if (event.event === 'delivered') bucket.delivered += 1
    else if (event.event === 'failed' || event.event === 'undelivered') bucket.failed += 1
    else if (event.event === 'click' || event.event === 'clicked' || event.event === 'clicks' || event.event === 'unique_click') bucket.clicks += 1
    else bucket.other += 1
    buckets.set(stamp, bucket)
  })
  return [...buckets.values()]
}

export function performanceSummary(stats) {
  if (!stats.sent && !stats.delivered && !stats.failed && !stats.clicks) {
    return stats.eligible
      ? `${formatCount(stats.eligible)} ${stats.eligible === 1 ? 'person can' : 'people can'} receive this campaign. Nothing has been sent yet.`
      : 'No delivery has been recorded yet.'
  }
  const delivered = `${formatCount(stats.delivered)} delivered of ${formatCount(stats.sent)} sent`
  const clicks = stats.clicks ? `, with ${formatCount(stats.clicks)} ${stats.clicks === 1 ? 'click' : 'clicks'}` : ''
  return `${delivered}${clicks}.`
}
