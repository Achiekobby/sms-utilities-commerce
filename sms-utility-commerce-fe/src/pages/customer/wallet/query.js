import { channelById } from './money'

export const emptyWalletFilters = { types: [], statuses: [] }

const typeLabel = { credit: 'Credit', debit: 'Debit' }
const statusLabel = { pending: 'Pending', completed: 'Completed' }

export function activeWalletFilterCount(filters) {
  return filters.types.length + filters.statuses.length
}

export function queryEntries(entries, { search = '', types = [], statuses = [] } = {}) {
  const term = search.trim().toLowerCase()
  return entries.filter((entry) => {
    if (types.length && !types.includes(entry.type)) return false
    if (statuses.length && !statuses.includes(entry.status)) return false
    if (!term) return true
    const channel = channelById(entry.channel)
    return [entry.description, entry.reference, entry.gateway, channel?.label, channel?.gatewayLabel]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
}

export function walletFilterChips(filters) {
  return [
    ...filters.types.map((id) => ({ key: `type-${id}`, group: 'types', id, label: typeLabel[id] })),
    ...filters.statuses.map((id) => ({ key: `status-${id}`, group: 'statuses', id, label: statusLabel[id] })),
  ]
}

export { statusLabel, typeLabel }
