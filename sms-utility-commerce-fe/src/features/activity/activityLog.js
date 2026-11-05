const acronyms = {
  otp: 'OTP',
  api: 'API',
  sms: 'SMS',
  id: 'ID',
  url: 'URL',
  ip: 'IP',
}

const metadataOrder = ['type', 'channel', 'units', 'source']

export function labelize(value) {
  const words = String(value ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (acronyms[lower]) return acronyms[lower]
      if (index === 0) return lower.charAt(0).toUpperCase() + lower.slice(1)
      return lower
    })
    .join(' ')
}

function isInternalKey(key) {
  const name = String(key ?? '').toLowerCase()
  return name === 'id' || name.endsWith('_id')
}

function unitsLabel(value) {
  const count = Number(value)
  if (!Number.isFinite(count)) return ''
  const amount = Number.isInteger(count) ? String(count) : String(value)
  return `${amount} ${count === 1 ? 'unit' : 'units'}`
}

function primitiveDetail(key, value) {
  if (value == null || value === '') return ''
  if (typeof value === 'boolean') return value ? labelize(key) : ''
  if (key === 'units' && (typeof value === 'number' || typeof value === 'string')) return unitsLabel(value)
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  if (typeof value === 'string') return labelize(value)
  return ''
}

export function formatMetadata(metadata) {
  if (metadata == null) return ''

  if (Array.isArray(metadata)) {
    return metadata
      .map((value, index) => primitiveDetail(String(index), value))
      .filter(Boolean)
      .join(' · ')
  }

  if (typeof metadata !== 'object') return primitiveDetail('value', metadata)

  const keys = Object.keys(metadata).filter((key) => !isInternalKey(key))
  const ordered = [
    ...metadataOrder.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !metadataOrder.includes(key)).sort(),
  ]

  return ordered
    .map((key) => primitiveDetail(key, metadata[key]))
    .filter(Boolean)
    .join(' · ')
}

function partyFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const name = String(data.name ?? '').trim()
  const email = String(data.email ?? '').trim()
  const type = String(data.type ?? '').trim()
  if (!name && !email && !type) return null
  return { type, name, email }
}

export function activityLogFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.id == null) return null

  const module = String(data.module ?? '').trim()
  const action = String(data.action ?? '').trim()
  const actor = String(data.actor ?? '').trim()

  return {
    id: String(data.id),
    title: String(data.title ?? '').trim(),
    module,
    moduleLabel: labelize(module),
    action,
    actionLabel: labelize(action),
    actor,
    actorLabel: labelize(actor),
    transmitter: partyFromApi(data.transmitter),
    receiver: partyFromApi(data.receiver),
    details: formatMetadata(data.metadata),
    createdAt: data.created_at == null ? '' : String(data.created_at),
  }
}
