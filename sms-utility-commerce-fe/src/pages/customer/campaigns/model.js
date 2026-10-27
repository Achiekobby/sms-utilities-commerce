export const campaignTypes = [
  {
    id: 'promotional',
    label: 'Promotional',
    hint: 'An offer or announcement. Use the person’s name so it does not read like a blast.',
    placeholder: 'Hi {firstName}, the weekend bundle is live. Reply YES and we will send the details.',
  },
  {
    id: 'transactional',
    label: 'Transactional',
    hint: 'A reminder or receipt about something the person already expects.',
    placeholder: 'Hi {firstName}, your utility bill is ready. Pay from your wallet before Friday.',
  },
  {
    id: 'survey',
    label: 'Survey',
    hint: 'A short ask for a response. One question keeps the reply rate up.',
    placeholder: 'Hi {firstName}, how was your last top-up? Reply 1 for good or 2 for poor.',
  },
]

export const statusLabel = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
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

export function typeLabel(type) {
  return campaignTypes.find((item) => item.id === type)?.label ?? type
}

export function segmentCount(body) {
  const length = body.length
  if (length === 0) return 0
  if (length <= singleSegment) return 1
  return Math.ceil(length / multiSegment)
}

export function messageCount(campaign) {
  return campaign.recipients * Math.max(campaign.segments, 1)
}

export function deliveryRate(campaign) {
  if (campaign.delivered == null) return '—'
  const total = messageCount(campaign)
  if (!total) return '—'
  return `${((campaign.delivered / total) * 100).toFixed(1)}%`
}

export function formatCreated(iso) {
  return createdFormat.format(new Date(iso))
}

export function formatSendAt(iso) {
  return sendFormat.format(new Date(iso))
}

export function whenLabel(campaign) {
  if (campaign.sendAt) return formatSendAt(campaign.sendAt)
  if (campaign.status === 'completed') return `Sent ${formatCreated(campaign.createdAt)}`
  return 'Sending now'
}

export function campaignGroups(campaign) {
  if (Array.isArray(campaign.groups) && campaign.groups.length) return campaign.groups
  if (!campaign.groupId) return []
  return [{ id: campaign.groupId, name: campaign.groupName, active: campaign.recipients }]
}

export const messagePlaceholders = [
  { id: 'firstName', token: '{firstName}', label: 'First name', sample: 'Ama', aliases: ['{{first_name}}', '{{firstName}}', '{first_name}'] },
  { id: 'lastName', token: '{lastName}', label: 'Last name', sample: 'Mensah', aliases: ['{{last_name}}', '{{lastName}}', '{last_name}'] },
  { id: 'fullName', token: '{fullName}', label: 'Full name', sample: 'Ama Mensah', aliases: ['{{full_name}}', '{{fullName}}', '{full_name}', '{{name}}', '{name}'] },
  { id: 'phone', token: '{phone}', label: 'Phone', sample: '024 123 4567', aliases: ['{{phone}}', '{{phone_number}}', '{phone_number}'] },
  { id: 'email', token: '{email}', label: 'Email', sample: 'ama@mensahstores.test', aliases: ['{{email}}', '{{email_address}}', '{email_address}'] },
  { id: 'businessName', token: '{businessName}', label: 'Business', sample: 'Mensah Market', aliases: ['{{business_name}}', '{{businessName}}', '{business_name}', '{{business}}', '{business}'] },
]

export function sampleMessage(body) {
  const replacements = messagePlaceholders.flatMap((item) => [
    [item.token, item.sample],
    ...item.aliases.map((alias) => [alias, item.sample]),
  ])
  replacements.sort((a, b) => b[0].length - a[0].length)
  return replacements.reduce((text, [token, sample]) => text.replaceAll(token, sample), body)
}

export function localDateTimeValue(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
