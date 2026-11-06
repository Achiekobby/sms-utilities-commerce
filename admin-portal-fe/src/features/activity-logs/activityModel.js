import { formatDate, formatWhen, labelize } from '../clients/clientModel'

export { formatDate, formatWhen, labelize }

export const emptyActivityFilters = {
  search: '',
  module: '',
  actor: '',
  action: '',
  clientId: '',
  adminId: '',
  from: '',
  to: '',
}

export function activityParams(filters, { page = 1, perPage = 15, includeClientId = true } = {}) {
  const params = { page, per_page: perPage }
  const search = String(filters?.search ?? '').trim()
  if (search) params.search = search
  if (filters?.module) params.module = filters.module
  if (filters?.actor) params.actor = filters.actor
  if (filters?.action) params.action = filters.action
  if (includeClientId && filters?.clientId) params.client_id = filters.clientId
  if (filters?.adminId) params.admin_id = filters.adminId
  if (filters?.from) params.from = filters.from
  if (filters?.to) params.to = filters.to
  return params
}

export function filterChoices(payload) {
  const source = payload && typeof payload === 'object' ? payload : {}
  const used = source.used && typeof source.used === 'object' ? source.used : {}

  function list(key) {
    const active = Array.isArray(used[key]) && used[key].length ? used[key] : source[key]
    return Array.isArray(active) ? active.filter((item) => typeof item === 'string' && item) : []
  }

  return {
    actors: list('actors'),
    modules: list('modules'),
    actions: list('actions'),
  }
}

export function drawerFilters(filters) {
  return {
    module: filters.module ?? '',
    actor: filters.actor ?? '',
    action: filters.action ?? '',
    clientId: filters.clientId ?? '',
    adminId: filters.adminId ?? '',
    from: filters.from ?? '',
    to: filters.to ?? '',
  }
}

export function activeDrawerCount(filters, { includeClientId = true } = {}) {
  const keys = ['module', 'actor', 'action', 'adminId', 'from', 'to']
  if (includeClientId) keys.push('clientId')
  return keys.filter((key) => filters?.[key]).length
}

export function describeActivityFilters(filters, { includeClientId = true } = {}) {
  const chips = []
  if (filters.actor) chips.push({ key: 'actor', label: labelize(filters.actor) })
  if (filters.module) chips.push({ key: 'module', label: labelize(filters.module) })
  if (filters.action) chips.push({ key: 'action', label: labelize(filters.action) })
  if (includeClientId && filters.clientId) chips.push({ key: 'clientId', label: `Client ${filters.clientId}` })
  if (filters.adminId) chips.push({ key: 'adminId', label: `Admin ${filters.adminId}` })
  if (filters.from) chips.push({ key: 'from', label: `From ${formatDate(filters.from)}` })
  if (filters.to) chips.push({ key: 'to', label: `To ${formatDate(filters.to)}` })
  return chips
}

export function partyLabel(party) {
  if (!party || typeof party !== 'object') return ''
  const name = String(party.name ?? '').trim()
  if (name) return name
  const email = String(party.email ?? '').trim()
  if (email) return email
  if (party.type && party.id != null) return `${party.type} ${party.id}`
  return String(party.type ?? '')
}

export function metadataRows(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return []
  return Object.entries(metadata).map(([key, value]) => ({
    key,
    label: labelize(key),
    value: value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value),
  }))
}

export function actionTone(action) {
  if (['created', 'approved', 'verified', 'assigned', 'unblacklisted'].includes(action)) return 'good'
  if (['deleted', 'rejected', 'blacklisted', 'invalid', 'expired'].includes(action)) return 'bad'
  if (['updated', 'requested'].includes(action)) return 'wait'
  return 'neutral'
}
