export const templateTypes = [
  { value: '', label: 'All types' },
  { value: 'quick_sms', label: 'Quick SMS' },
  { value: 'bulk_sms', label: 'Bulk SMS' },
  { value: 'campaign_promotion', label: 'Promotion' },
  { value: 'campaign_occasion', label: 'Occasion' },
  { value: 'survey', label: 'Survey' },
]

export const templateTypeOptions = templateTypes.filter((item) => item.value)

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

/** Map API template type → campaign wizard type when “Use” is clicked. */
export function campaignTypeFromTemplate(type) {
  if (type === 'campaign_occasion' || type === 'occasion') return 'occasion'
  if (type === 'campaign_promotion' || type === 'promotion' || type === 'promotional') return 'promotion'
  return null
}

export function displayTypeForBadge(type) {
  if (type === 'campaign_occasion') return 'occasion'
  if (type === 'campaign_promotion') return 'promotion'
  return type
}

function ctaFromApi(cta) {
  if (!cta || typeof cta !== 'object' || Array.isArray(cta)) return null
  const type = String(cta.type ?? '').toLowerCase()
  if (!type || cta.enabled === false) return null
  return {
    type,
    label: String(cta.label ?? '').trim(),
    url: cta.url == null ? '' : String(cta.url).trim(),
    value: cta.value == null ? '' : String(cta.value).trim(),
    enabled: cta.enabled !== false,
  }
}

function questionsFromApi(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((row, index) => {
      if (!row || typeof row !== 'object') return null
      const options = Array.isArray(row.options) ? row.options.map((item) => String(item)) : null
      return {
        type: String(row.type ?? 'text'),
        prompt: String(row.prompt ?? '').trim(),
        options,
        position: Number(row.position) || index + 1,
        required: Boolean(row.required),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.position - b.position)
}

export function templateFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.id == null) return null

  const type = String(data.type ?? '').toLowerCase()
  const cta = ctaFromApi(data.cta)
  const questions = questionsFromApi(data.questions)
  const placeholders = (Array.isArray(data.placeholders) ? data.placeholders : []).map(String)

  return {
    id: String(data.id),
    scope: String(data.scope ?? ''),
    isSystem: Boolean(data.is_system),
    isMine: Boolean(data.is_mine),
    canEdit: Boolean(data.can_edit),
    canDelete: Boolean(data.can_delete),
    type,
    occasionType: data.occasion_type == null ? '' : String(data.occasion_type),
    category: String(data.category ?? ''),
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    intro: data.intro == null ? '' : String(data.intro),
    body: String(data.body ?? ''),
    cta,
    questions,
    placeholders,
    status: String(data.status ?? 'active').toLowerCase() || 'active',
    createdAt: data.created_at ? String(data.created_at).replace(' ', 'T') : '',
    updatedAt: data.updated_at ? String(data.updated_at).replace(' ', 'T') : '',
  }
}
