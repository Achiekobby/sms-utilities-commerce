export const templateTypes = [
  { value: '', label: 'All types' },
  { value: 'quick_sms', label: 'Quick SMS' },
  { value: 'bulk_sms', label: 'Bulk SMS' },
  { value: 'campaign_promotion', label: 'Promotion' },
  { value: 'campaign_occasion', label: 'Occasion' },
  { value: 'survey', label: 'Survey' },
]

export const templateStatuses = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
]

export function labelize(value) {
  return String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function templateTypeLabel(type) {
  return templateTypes.find((item) => item.value === type)?.label ?? labelize(type)
}

export function templateStatusTone(status) {
  const key = String(status ?? '').toLowerCase()
  if (key === 'active') return 'good'
  if (key === 'draft') return 'wait'
  if (key === 'inactive') return 'bad'
  return 'neutral'
}

export function templateMatches(template, query) {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    template.name,
    template.description,
    template.body,
    template.category,
    template.type,
    template.occasion_type,
    template.scope,
    template.status,
    ...(Array.isArray(template.placeholders) ? template.placeholders : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

export function formatTemplateWhen(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
  if (!match) return value ? String(value) : '—'
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]))
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
