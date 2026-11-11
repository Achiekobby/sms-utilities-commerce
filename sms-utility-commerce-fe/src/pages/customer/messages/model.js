export const messageKinds = [
  {
    id: 'numbers',
    label: 'To numbers',
    hint: 'Type the mobile numbers, separated by commas.',
  },
  {
    id: 'groups',
    label: 'To groups',
    hint: 'Choose one or more contact groups. Only active contacts are included.',
  },
]

export const maxNumbers = 500

export function kindLabel(kind) {
  return messageKinds.find((item) => item.id === kind)?.label ?? kind
}

export function toStoredNumber(raw) {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length === 12) digits = digits.slice(3)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length !== 9) return null
  return `+233${digits}`
}

export function formatStoredNumber(stored) {
  const digits = String(stored).replace(/\D/g, '')
  const local = digits.startsWith('233') ? digits.slice(3) : digits
  if (local.length !== 9) return stored
  return `0${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
}

export function toApiNumber(stored) {
  const digits = String(stored ?? '').replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length === 12) return digits
  if (digits.length === 9) return `233${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`
  return ''
}

export function resolvedMessageType(values) {
  if (values?.type === 'other') return String(values.customType ?? '').trim()
  return String(values?.type ?? '').trim()
}

export function quickMessageTitle(body) {
  const text = String(body ?? '').trim().replace(/\s+/g, ' ')
  if (!text) return 'SMS'
  return text.length > 48 ? `${text.slice(0, 45)}…` : text
}

export function quickSmsBody({ from, numbers, message }) {
  return {
    from: String(from ?? '').trim(),
    to: numbers.map(toApiNumber).filter(Boolean),
    message: String(message ?? '').trim(),
  }
}

export function bulkSmsBody({ from, groups, message }) {
  return {
    from: String(from ?? '').trim(),
    contact_group_ids: groups
      .map((group) => Number(group.id))
      .filter((id) => Number.isFinite(id) && id > 0),
    message: String(message ?? '').trim(),
  }
}

function deliveryFromApi(data) {
  const delivery = data?.delivery && typeof data.delivery === 'object' ? data.delivery : null
  const sent = delivery?.sent ?? data?.sent
  const delivered = delivery?.delivered ?? data?.delivered
  const failed = delivery?.failed ?? data?.failed
  const pending = delivery?.pending ?? data?.pending
  return {
    ...(sent != null ? { sent: Number(sent) } : {}),
    ...(delivered != null ? { delivered: Number(delivered) } : {}),
    ...(failed != null ? { failed: Number(failed) } : {}),
    ...(pending != null ? { pending: Number(pending) } : {}),
  }
}

function storedNumberFromApi(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length === 12) return `+${digits}`
  return toStoredNumber(raw) || String(raw ?? '')
}

export function smsFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.id == null) return null

  const apiType = String(data.type ?? '').toLowerCase()
  const kind = apiType === 'bulk' ? 'groups' : 'numbers'
  const body = String(data.message ?? '')
  const groups = (Array.isArray(data.contact_groups) ? data.contact_groups : [])
    .filter((group) => group?.id != null)
    .map((group) => ({
      id: String(group.id),
      name: String(group.name ?? ''),
      active: Number(group.count_of_contacts) || 0,
    }))
  const numbers = (Array.isArray(data.to) ? data.to : []).map(storedNumberFromApi).filter(Boolean)

  return {
    id: String(data.id),
    name: quickMessageTitle(body),
    kind,
    apiType,
    resource: data.resource == null ? 'sms' : String(data.resource),
    requestType: data.request_type == null ? '' : String(data.request_type),
    mode: data.mode == null ? '' : String(data.mode),
    parentId: data.parent_id == null ? null : String(data.parent_id),
    messageId: data.message_id == null ? '' : String(data.message_id),
    type: '',
    sender: String(data.from ?? ''),
    body,
    segments: Number(data.parts) || 1,
    recipients: Number(data.recipients) || numbers.length || groups.reduce((sum, group) => sum + group.active, 0),
    numbers,
    groups,
    contactGroupIds: (Array.isArray(data.contact_group_ids) ? data.contact_group_ids : groups.map((group) => group.id)).map(
      String,
    ),
    sendAt: null,
    status: String(data.status ?? 'completed').toLowerCase() || 'completed',
    createdAt: data.created_at ? String(data.created_at).replace(' ', 'T') : '',
    completedAt: data.completed_at ? String(data.completed_at).replace(' ', 'T') : '',
    unitsUsed: data.units_used == null ? null : Number(data.units_used),
    unitsRefunded: data.units_refunded == null ? null : Number(data.units_refunded),
    unitsBefore: data.units_before == null ? null : Number(data.units_before),
    ...deliveryFromApi(data),
  }
}

function messageFromSmsSend({ kind, values, numbers = [], groups = [], result, segments }) {
  const mapped = smsFromApi(result?.data)
  if (mapped) {
    if (kind === 'numbers' && !mapped.numbers.length && numbers.length) mapped.numbers = numbers
    if (kind === 'groups' && !mapped.groups.length && groups.length) {
      mapped.groups = groups.map((group) => ({
        id: String(group.id),
        name: group.name,
        active: group.breakdown?.active ?? 0,
      }))
    }
    if (!mapped.segments) mapped.segments = segments || 1
    return mapped
  }

  const body = values.body.trim()
  const mappedGroups =
    kind === 'groups'
      ? groups.map((group) => ({ id: String(group.id), name: group.name, active: group.breakdown.active }))
      : []
  return {
    id: crypto.randomUUID(),
    name: quickMessageTitle(body),
    kind,
    apiType: kind === 'groups' ? 'bulk' : 'quick',
    resource: 'sms',
    requestType: 'system',
    mode: 'send',
    parentId: null,
    messageId: '',
    type: '',
    sender: values.sender,
    body,
    segments: segments || 1,
    recipients: kind === 'numbers' ? numbers.length : activeRecipients(groups),
    numbers: kind === 'numbers' ? numbers : [],
    groups: mappedGroups,
    contactGroupIds: mappedGroups.map((group) => group.id),
    sendAt: null,
    status: kind === 'groups' ? 'queued' : 'completed',
    createdAt: new Date().toISOString(),
    completedAt: '',
    unitsUsed: null,
    unitsRefunded: null,
    unitsBefore: null,
  }
}

export function messageFromQuickSend(args) {
  return messageFromSmsSend({ ...args, kind: 'numbers' })
}

export function messageFromBulkSend(args) {
  return messageFromSmsSend({ ...args, kind: 'groups' })
}

export function parseNumberList(raw) {
  const tokens = String(raw)
    .split(/[\n,;]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const valid = []
  const invalid = []
  const seen = new Set()
  let duplicates = 0

  tokens.forEach((token) => {
    const stored = toStoredNumber(token)
    if (!stored) {
      invalid.push(token)
      return
    }
    if (seen.has(stored)) {
      duplicates += 1
      return
    }
    seen.add(stored)
    valid.push(stored)
  })

  return { valid, invalid, duplicates }
}

export function validateNumbers(raw) {
  const parsed = parseNumberList(raw)
  if (parsed.valid.length === 0 && parsed.invalid.length === 0) {
    return { numbers: 'Enter at least one number, separated by commas.' }
  }
  if (parsed.invalid.length > 0) {
    const shown = parsed.invalid.slice(0, 3).join(', ')
    const more = parsed.invalid.length > 3 ? ` and ${parsed.invalid.length - 3} more` : ''
    return { numbers: `Check these numbers: ${shown}${more}. Use 024 123 4567.` }
  }
  if (parsed.valid.length > maxNumbers) {
    return { numbers: `A number list can include up to ${maxNumbers} numbers.` }
  }
  return {}
}

export function validateGroups(groups) {
  if (!groups.length) return { groupIds: 'Choose at least one contact group.' }
  if (groups.some((group) => group.breakdown.active < 1)) {
    return { groupIds: 'Every group needs at least one active contact.' }
  }
  return {}
}

export function activeRecipients(groups) {
  return groups.reduce((sum, group) => sum + group.breakdown.active, 0)
}

export function messageDeliveryTotal(message) {
  if (message?.sent != null && Number(message.sent) > 0) return Number(message.sent)
  const parts =
    (Number(message?.delivered) || 0) + (Number(message?.pending) || 0) + (Number(message?.failed) || 0)
  if (parts > 0) return parts
  return Number(message?.recipients) || 0
}

export function messageDeliveryRate(message) {
  if (message?.delivered == null) return '—'
  const total = messageDeliveryTotal(message)
  if (!total) return '—'
  return `${((Number(message.delivered) / total) * 100).toFixed(1)}%`
}

export function messageHasDelivery(message) {
  return message?.delivered != null || message?.sent != null || message?.failed != null || message?.pending != null
}

export function messageFailedCount(message) {
  const value = Number(message?.failed)
  return Number.isFinite(value) && value > 0 ? value : 0
}

/** Reblast only when delivery reported failed recipients. */
export function canReblastMessage(message) {
  return Boolean(message?.id) && messageFailedCount(message) > 0
}

/** Resend for any saved message that is not still mid-send. */
export function canResendMessage(message) {
  if (!message?.id) return false
  const status = String(message.status ?? '').toLowerCase()
  return status !== 'queued' && status !== 'sending' && status !== 'processing'
}

export function defaultResendMessage(message) {
  return String(message?.body ?? '').trim()
}

export function defaultReblastMessage(message) {
  const body = String(message?.body ?? '').trim()
  if (!body) return 'Reblast'
  return body
}
