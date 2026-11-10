export const emptyMessageFilters = {
  search: '',
  types: [],
  from: '',
  to: '',
  sort: 'newest',
}

export const messageTypeOptions = [
  { id: 'numbers', label: 'Quick', detail: 'To numbers' },
  { id: 'groups', label: 'Bulk', detail: 'To groups' },
]

export const messageSortOptions = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
]

export function messageTypeLabel(kind) {
  return messageTypeOptions.find((item) => item.id === kind)?.label ?? kind
}

export function activeMessageFilterCount(filters) {
  return (
    (filters.search.trim() ? 1 : 0) +
    filters.types.length +
    (filters.from ? 1 : 0) +
    (filters.to ? 1 : 0) +
    (filters.sort !== 'newest' ? 1 : 0)
  )
}

function dayKey(value) {
  const match = String(value ?? '').match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

export function queryMessages(messages, filters = emptyMessageFilters) {
  const term = String(filters.search ?? '').trim().toLowerCase()
  const types = Array.isArray(filters.types) ? filters.types : []
  const from = filters.from || ''
  const to = filters.to || ''
  const sort = filters.sort === 'oldest' ? 'oldest' : 'newest'

  const rows = messages.filter((message) => {
    if (types.length && !types.includes(message.kind)) return false

    const created = dayKey(message.createdAt)
    if (from && (!created || created < from)) return false
    if (to && (!created || created > to)) return false

    if (!term) return true
    const groupNames = (message.groups ?? []).map((group) => group.name).join(' ')
    const numbers = (message.numbers ?? []).join(' ')
    const haystack = `${message.name} ${message.body} ${messageTypeLabel(message.kind)} ${message.sender} ${groupNames} ${numbers}`.toLowerCase()
    return haystack.includes(term)
  })

  return rows.sort((left, right) => {
    const compare = String(left.createdAt ?? '').localeCompare(String(right.createdAt ?? ''))
    return sort === 'oldest' ? compare : -compare
  })
}

export function messageFilterChips(filters) {
  const chips = []
  const search = filters.search.trim()
  if (search) chips.push({ key: 'search', group: 'search', id: 'search', label: `“${search}”` })
  filters.types.forEach((id) => {
    const option = messageTypeOptions.find((item) => item.id === id)
    chips.push({ key: `type-${id}`, group: 'types', id, label: option?.label ?? id })
  })
  if (filters.from) chips.push({ key: 'from', group: 'from', id: 'from', label: `From ${filters.from}` })
  if (filters.to) chips.push({ key: 'to', group: 'to', id: 'to', label: `To ${filters.to}` })
  if (filters.sort === 'oldest') chips.push({ key: 'sort', group: 'sort', id: 'oldest', label: 'Oldest first' })
  return chips
}
