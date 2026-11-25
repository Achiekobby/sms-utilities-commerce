import { templateTypeLabel } from '../../../features/templates/templateModel'

export const emptyMessageFilters = {
  search: '',
  type: '',
  status: '',
  requestType: '',
  mode: '',
  contactGroupId: '',
  from: '',
  to: '',
}

export const messageTypeOptions = [
  { id: 'quick', label: 'Quick', detail: 'To numbers', kind: 'numbers' },
  { id: 'bulk', label: 'Bulk', detail: 'To groups', kind: 'groups' },
]

export const messageStatusOptions = [
  { id: 'queued', label: 'Queued' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'sending', label: 'Sending' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
  { id: 'cancelled', label: 'Cancelled' },
]

export const messageRequestTypeOptions = [
  { id: 'system', label: 'System' },
  { id: 'campaign', label: 'Campaign' },
]

export const messageModeOptions = [
  { id: 'send', label: 'Send' },
  { id: 'resend', label: 'Resend' },
  { id: 'reblast', label: 'Reblast' },
]

export function messageTypeLabel(value) {
  if (value === 'numbers' || value === 'groups') {
    return messageTypeOptions.find((item) => item.kind === value)?.label ?? value
  }
  return messageTypeOptions.find((item) => item.id === value)?.label ?? value
}

export function activeMessageFilterCount(filters) {
  return (
    (filters.type ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.requestType ? 1 : 0) +
    (filters.mode ? 1 : 0) +
    (filters.contactGroupId ? 1 : 0) +
    (filters.from ? 1 : 0) +
    (filters.to ? 1 : 0)
  )
}

export function messagesQueryParams(filters = emptyMessageFilters, { page = 1, perPage = 15 } = {}) {
  const params = {
    page,
    per_page: perPage,
  }

  if (filters.contactGroupId) params.contact_group_id = filters.contactGroupId
  if (filters.type) params.type = filters.type
  if (filters.status) params.status = filters.status
  if (filters.requestType) params.request_type = filters.requestType
  if (filters.mode) params.mode = filters.mode
  if (filters.from) params.from_date = filters.from
  if (filters.to) params.to_date = filters.to

  return params
}

/** Client-side search over the current API page (search is not a server param). */
export function queryMessages(messages, filters = emptyMessageFilters) {
  const term = String(filters.search ?? '').trim().toLowerCase()
  if (!term) return messages

  return messages.filter((message) => {
    const groupNames = (message.groups ?? []).map((group) => group.name).join(' ')
    const numbers = (message.numbers ?? []).join(' ')
    const sourceLabel = message.source ? templateTypeLabel(message.source) : ''
    const haystack =
      `${message.name} ${message.body} ${messageTypeLabel(message.kind)} ${sourceLabel} ${message.source ?? ''} ${message.sender} ${groupNames} ${numbers}`.toLowerCase()
    return haystack.includes(term)
  })
}

export function messageFilterChips(filters, groups = []) {
  const chips = []
  if (filters.type) {
    const option = messageTypeOptions.find((item) => item.id === filters.type)
    chips.push({ key: `type-${filters.type}`, group: 'type', id: filters.type, label: option?.label ?? filters.type })
  }
  if (filters.status) {
    const option = messageStatusOptions.find((item) => item.id === filters.status)
    chips.push({
      key: `status-${filters.status}`,
      group: 'status',
      id: filters.status,
      label: option?.label ?? filters.status,
    })
  }
  if (filters.requestType) {
    const option = messageRequestTypeOptions.find((item) => item.id === filters.requestType)
    chips.push({
      key: `request-${filters.requestType}`,
      group: 'requestType',
      id: filters.requestType,
      label: option?.label ?? filters.requestType,
    })
  }
  if (filters.mode) {
    const option = messageModeOptions.find((item) => item.id === filters.mode)
    chips.push({ key: `mode-${filters.mode}`, group: 'mode', id: filters.mode, label: option?.label ?? filters.mode })
  }
  if (filters.contactGroupId) {
    const group = groups.find((item) => String(item.id) === String(filters.contactGroupId))
    chips.push({
      key: `group-${filters.contactGroupId}`,
      group: 'contactGroupId',
      id: filters.contactGroupId,
      label: group?.name ? `Group · ${group.name}` : `Group ${filters.contactGroupId}`,
    })
  }
  if (filters.from) chips.push({ key: 'from', group: 'from', id: 'from', label: `From ${filters.from}` })
  if (filters.to) chips.push({ key: 'to', group: 'to', id: 'to', label: `To ${filters.to}` })
  return chips
}
