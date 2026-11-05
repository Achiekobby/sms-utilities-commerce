const dayStamp = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function firstRecord(data) {
  if (Array.isArray(data)) return data[0] ?? null
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data[0] ?? null
    if (Array.isArray(data.api_keys)) return data.api_keys[0] ?? null
    return data
  }
  return null
}

function prefixFromToken(token) {
  const value = String(token ?? '').trim()
  if (!value) return ''
  // Existing keys use a 12-character prefix (`cgk_` plus 8 characters).
  return value.slice(0, 12)
}

export function apiKeyFromApi(data) {
  const record = firstRecord(data)
  if (!record || typeof record !== 'object' || record.id == null) return null

  const token = typeof record.token === 'string' ? record.token.trim() : ''
  const prefix = String(record.prefix ?? record.key_prefix ?? '').trim() || prefixFromToken(token)
  if (!prefix && !token) return null

  return {
    id: String(record.id),
    clientId: record.client_id == null ? '' : String(record.client_id),
    name: String(record.name ?? '').trim(),
    description: String(record.description ?? '').trim(),
    prefix,
    token,
    status: String(record.status ?? 'active').toLowerCase(),
    lastUsedAt: record.last_used_at || null,
    createdAt: record.created_at ?? '',
  }
}

export function maskedApiKey(prefix) {
  const head = String(prefix ?? '').trim()
  if (!head) return ''
  return `${head}${'•'.repeat(28)}`
}

export function formatApiKeyDay(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return dayStamp.format(date)
}

export function formatLastUsed(value) {
  if (!value) return 'Never used'
  return formatApiKeyDay(value) || 'Never used'
}
