export const campaignTypes = [
  {
    id: 'occasion',
    label: 'Occasion',
    hint: 'Automatically send messages around birthdays, anniversaries, reminders, and other important dates.',
    examples: ['Birthdays', 'Anniversaries', 'Reminders'],
    placeholder: 'Hi {firstName}, happy birthday from {businessName}! Enjoy a special treat on us today.',
  },
  {
    id: 'promotion',
    label: 'Promotion',
    hint: 'Tell customers about sales, discounts, special offers, and business promotions.',
    examples: ['Sales', 'Discounts', 'Special offers'],
    placeholder: 'Hi {firstName}, our Black Friday sale is here! Get 20% off until Nov 30.',
  },
]

export const occasionTypes = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'appointment', label: 'Appointment reminder' },
  { id: 'membership', label: 'Membership renewal' },
  { id: 'custom', label: 'Custom date' },
]

export const triggerOffsets = [
  { id: 'on', label: 'On the occasion', days: 0 },
  { id: '1', label: '1 day before', days: 1 },
  { id: '3', label: '3 days before', days: 3 },
  { id: '7', label: '7 days before', days: 7 },
  { id: 'custom', label: 'Custom', days: null },
]

export const statusLabel = {
  draft: 'Draft',
  active: 'Active',
  scheduled: 'Scheduled',
  sending: 'Sending',
  completed: 'Completed',
  paused: 'Paused',
  failed: 'Failed',
  // Legacy seeds / older local records
  queued: 'Queued',
  in_progress: 'Sending',
}

const singleSegment = 160
const multiSegment = 153
export const maxSegments = 6
export const maxBodyLength = multiSegment * maxSegments

const createdFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const sendFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

export function typeLabel(type) {
  return campaignTypes.find((item) => item.id === type)?.label ?? type
}

export function occasionTypeLabel(id) {
  return occasionTypes.find((item) => item.id === id)?.label ?? id
}

export function triggerOffsetLabel(id) {
  return triggerOffsets.find((item) => item.id === id)?.label ?? id
}

export function segmentCount(body) {
  const length = String(body ?? '').length
  if (length === 0) return 0
  if (length <= singleSegment) return 1
  return Math.ceil(length / multiSegment)
}

export function messageCount(campaign) {
  return (Number(campaign.recipients) || 0) * Math.max(Number(campaign.segments) || 1, 1)
}

export function deliveryRate(campaign) {
  if (campaign.delivered == null) return '—'
  const total =
    campaign.sent != null && Number(campaign.sent) > 0
      ? Number(campaign.sent)
      : (Number(campaign.delivered) || 0) + (Number(campaign.pending) || 0) + (Number(campaign.failed) || 0) ||
        messageCount(campaign)
  if (!total) return '—'
  return `${((Number(campaign.delivered) / total) * 100).toFixed(1)}%`
}

export function formatCreated(iso) {
  if (!iso) return '—'
  return createdFormat.format(new Date(iso))
}

export function formatSendAt(iso) {
  if (!iso) return '—'
  return sendFormat.format(new Date(iso))
}

export function formatSendTime(value) {
  if (!value) return '—'
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [hours, minutes] = value.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return timeFormat.format(date)
  }
  return formatSendAt(value)
}

export function scheduleLabel(campaign) {
  if (campaign.type === 'occasion') {
    const offset = triggerOffsetLabel(campaign.triggerOffset || 'on')
    const time = formatSendTime(campaign.sendTime || '09:00')
    const repeat = campaign.repeatYearly ? ' · Every year' : ''
    return `${offset} at ${time}${repeat}`
  }
  if (campaign.sendAt) return formatSendAt(campaign.sendAt)
  if (campaign.status === 'completed') return `Sent ${formatCreated(campaign.createdAt)}`
  if (campaign.status === 'draft') return '—'
  return 'Send now'
}

export function whenLabel(campaign) {
  return scheduleLabel(campaign)
}

export function campaignGroups(campaign) {
  if (Array.isArray(campaign.groups) && campaign.groups.length) return campaign.groups
  if (!campaign.groupId) return []
  return [{ id: campaign.groupId, name: campaign.groupName, active: campaign.recipients }]
}

export function audienceLabel(campaign) {
  const groups = campaignGroups(campaign)
  if (!groups.length) return campaign.audienceLabel || '—'
  if (groups.length === 1) return groups[0].name
  return `${groups.length} groups`
}

export function campaignMetrics(campaigns) {
  let sent = 0
  let delivered = 0
  let failed = 0
  let active = 0

  campaigns.forEach((campaign) => {
    if (campaign.status === 'active' || campaign.status === 'sending' || campaign.status === 'in_progress') active += 1
    if (campaign.delivered != null || campaign.failed != null || campaign.sent != null) {
      sent += Number(campaign.sent ?? messageCount(campaign)) || 0
      delivered += Number(campaign.delivered) || 0
      failed += Number(campaign.failed) || 0
    }
  })

  const rate = sent > 0 ? `${((delivered / sent) * 100).toFixed(1)}%` : null
  return { sent, delivered, failed, active, rate }
}

export const messagePlaceholders = [
  { id: 'firstName', token: '{firstName}', label: 'First name', sample: 'John', aliases: ['{{first_name}}', '{{firstName}}', '{first_name}'] },
  { id: 'lastName', token: '{lastName}', label: 'Last name', sample: 'Mensah', aliases: ['{{last_name}}', '{{lastName}}', '{last_name}'] },
  { id: 'fullName', token: '{fullName}', label: 'Full name', sample: 'John Mensah', aliases: ['{{full_name}}', '{{fullName}}', '{full_name}', '{{name}}', '{name}'] },
  { id: 'phone', token: '{phone}', label: 'Phone', sample: '024 123 4567', aliases: ['{{phone}}', '{{phone_number}}', '{phone_number}'] },
  { id: 'email', token: '{email}', label: 'Email', sample: 'john@mensahstores.test', aliases: ['{{email}}', '{{email_address}}', '{email_address}'] },
  { id: 'businessName', token: '{businessName}', label: 'Business', sample: 'Mensah Market', aliases: ['{{business_name}}', '{{businessName}}', '{business_name}', '{{business}}', '{business}'] },
  { id: 'birthday', token: '{birthday}', label: 'Birthday', sample: '12 Mar', aliases: ['{{birthday}}'] },
]

export function sampleMessage(body, extraPlaceholders = []) {
  const replacements = [...messagePlaceholders, ...extraPlaceholders].flatMap((item) => [
    [item.token, item.sample],
    ...(item.aliases ?? []).map((alias) => [alias, item.sample]),
  ])
  replacements.sort((a, b) => b[0].length - a[0].length)
  return replacements.reduce((text, [token, sample]) => text.replaceAll(token, sample), String(body ?? ''))
}

export function localDateTimeValue(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
