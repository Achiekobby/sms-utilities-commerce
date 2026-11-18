import * as XLSX from 'xlsx'
import { campaignsApi } from '../../../services/api/campaigns/campaignsApi'
import { eventLabel } from './insights'

const MAX_PAGES = 40

function fileName(name) {
  const slug = String(name ?? 'campaign')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'campaign'}-insights.xlsx`
}

export async function collectCampaignEvents(dispatch, id) {
  const rows = []
  let page = 1
  let lastPage
  do {
    const request = dispatch(campaignsApi.endpoints.getCampaignEvents.initiate({ id, page, perPage: 50 }))
    const data = await request.unwrap()
    request.unsubscribe()
    rows.push(...(data.rows ?? []))
    lastPage = data.lastPage || 1
    page += 1
  } while (page <= lastPage && page <= MAX_PAGES)

  return { rows, truncated: page <= lastPage }
}

export function downloadInsights({ campaignName, stats, events, truncated = false }) {
  const summary = [
    ['Metric', 'Value'],
    ['Eligible recipients', stats.eligible],
    ['Sent', stats.sent],
    ['Delivered', stats.delivered],
    ['Failed', stats.failed],
    ['Clicks', stats.clicks],
    ['Unique clicks', stats.uniqueClicks],
    ['Delivery rate (%)', Number(stats.deliveryRate.toFixed(1))],
    ['Click rate (%)', Number(stats.clickRate.toFixed(1))],
  ]
  const eventRows = [
    ['When', 'Phone', 'Event', 'Contact ID', 'Inbox ID'],
    ...events.map((event) => [event.when, event.phone, eventLabel(event.event), event.contactId, event.inboxId]),
  ]
  if (truncated) eventRows.push(['Export stopped after 2,000 events.'])

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Analytics')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(eventRows), 'Events')
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName(campaignName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
