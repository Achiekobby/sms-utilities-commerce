export const campaignTypes = [
  {
    id: 'occasion',
    label: 'Occasion',
    hint: 'Automatically send messages around birthdays, anniversaries, holidays, and other important dates.',
    examples: ['Birthdays', 'Anniversaries', 'Holidays'],
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
  { id: 'holiday', label: 'Holiday' },
  { id: 'custom', label: 'Custom date' },
]

export const triggerOffsets = [
  { id: 'on', label: 'On the occasion', days: 0 },
  { id: 'one_day_before', label: '1 day before', days: 1 },
  { id: 'three_days_before', label: '3 days before', days: 3 },
  { id: 'one_week_before', label: '1 week before', days: 7 },
  { id: 'custom', label: 'Custom', days: null },
]

const triggerOffsetAliases = {
  on: 'on',
  same_day: 'on',
  one_day_before: 'one_day_before',
  '1': 'one_day_before',
  three_days_before: 'three_days_before',
  '3': 'three_days_before',
  one_week_before: 'one_week_before',
  '7': 'one_week_before',
  before: 'custom',
  after: 'custom',
  custom: 'custom',
}

export function normalizeTriggerOffset(value) {
  const key = String(value ?? '').trim().toLowerCase()
  return triggerOffsetAliases[key] || (triggerOffsets.some((item) => item.id === key) ? key : 'on')
}

export const statusLabel = {
  draft: 'Draft',
  active: 'Active',
  scheduled: 'Scheduled',
  sending: 'Sending',
  completed: 'Completed',
  paused: 'Paused',
  failed: 'Failed',
  cancelled: 'Cancelled',
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
  const key = normalizeTriggerOffset(id)
  return triggerOffsets.find((item) => item.id === key)?.label ?? id
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
  const raw = String(iso)
  const day = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const midnight = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ]00:00(?::00)?/)
  const parts = day || midnight
  if (parts) return createdFormat.format(new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])))
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
    const occasion = occasionTypeLabel(campaign.occasionType) || 'Occasion'
    const offset =
      campaign.triggerOffset === 'custom'
        ? `${campaign.customOffsetDays ?? '—'} days before`
        : triggerOffsetLabel(campaign.triggerOffset || 'on')
    const time = formatSendTime(campaign.sendTime || '09:00')
    const repeat = campaign.repeatYearly ? ' · Every year' : ''
    return `${occasion} · ${offset} at ${time}${repeat}`
  }
  if (campaign.sendAt) return formatSendAt(campaign.sendAt)
  if (campaign.status === 'completed') return `Sent ${formatCreated(campaign.createdAt)}`
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
  const groupText = groups.length
    ? groups.length === 1
      ? groups[0].name
      : `${groups.length} groups`
    : campaign.audienceLabel || ''
  const eligible = Number(campaign.eligibleRecipients)
  if (Number.isFinite(eligible) && eligible > 0) {
    const count = `${eligible} eligible`
    return groupText ? `${groupText} · ${count}` : count
  }
  return groupText || '—'
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

export const promotionPlaceholders = [
  { id: 'firstName', token: '{firstName}', label: 'First name', sample: 'John', aliases: ['{first_name}'] },
  { id: 'lastName', token: '{lastName}', label: 'Last name', sample: 'Mensah', aliases: ['{last_name}'] },
  { id: 'fullName', token: '{fullName}', label: 'Full name', sample: 'John Mensah', aliases: ['{full_name}'] },
  {
    id: 'businessName',
    token: '{businessName}',
    label: 'Business name',
    sample: 'Cellogent',
    aliases: ['{business_name}'],
  },
]

export const occasionPlaceholders = [
  { id: 'firstName', token: '{firstName}', label: 'First name', sample: 'John', aliases: ['{first_name}'] },
  { id: 'lastName', token: '{lastName}', label: 'Last name', sample: 'Mensah', aliases: ['{last_name}'] },
  { id: 'name', token: '{name}', label: 'Name', sample: 'John' },
  { id: 'fullName', token: '{fullName}', label: 'Full name', sample: 'John Mensah', aliases: ['{full_name}'] },
  {
    id: 'businessName',
    token: '{businessName}',
    label: 'Business name',
    sample: 'Cellogent',
    aliases: ['{business_name}'],
  },
  { id: 'email', token: '{email}', label: 'Email', sample: 'john@mensahstores.test' },
  {
    id: 'dob',
    token: '{dob}',
    label: 'Date of birth',
    sample: '12 Mar 1990',
    aliases: ['{dateOfBirth}', '{date_of_birth}'],
  },
  { id: 'region', token: '{region}', label: 'Region', sample: 'Greater Accra' },
  { id: 'city', token: '{city}', label: 'City', sample: 'Accra' },
  {
    id: 'gpsAddress',
    token: '{gpsAddress}',
    label: 'GPS address',
    sample: 'GA-123-4567',
    aliases: ['{gps_address}'],
  },
]

/** All known tokens for preview replacement. */
export const messagePlaceholders = [...occasionPlaceholders]

export function placeholdersForType(type) {
  return type === 'promotion' ? promotionPlaceholders : occasionPlaceholders
}

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
