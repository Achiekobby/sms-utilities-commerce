import { statusLabel } from './model'

export const emptySenderFilters = {
  statuses: [],
}

export function activeSenderFilterCount(filters) {
  return filters.statuses.length
}

function includes(list, value) {
  return list.length === 0 || list.includes(value)
}

export function querySenderIds(records, { search = '', statuses = [] } = {}) {
  const term = search.trim().toLowerCase()

  return records.filter((item) => {
    if (!includes(statuses, item.status)) return false
    if (!term) return true
    const haystack = [item.name, item.purpose, item.sample, item.reason, statusLabel[item.status]].join(' ').toLowerCase()
    return haystack.includes(term)
  })
}

export function senderFilterChips(filters) {
  return filters.statuses.map((id) => ({ key: `status-${id}`, id, label: statusLabel[id] }))
}
