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

/** Plan SMS billing: 1 unit covers up to 160 characters; 161–320 uses 2 units, and so on. */
export const charsPerSmsUnit = 160

export function kindLabel(kind) {
  return messageKinds.find((item) => item.id === kind)?.label ?? kind
}

export function smsUnitCount(body) {
  const length = String(body ?? '').length
  if (length <= 0) return 0
  return Math.ceil(length / charsPerSmsUnit)
}

export function smsSendUnits({ body, recipients }) {
  return smsUnitCount(body) * Math.max(0, Number(recipients) || 0)
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

function clockTime(value) {
  const match = String(value ?? '').match(/^(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

export function quickSmsBody({ from, numbers, message, when = 'now', sendAt = '', sendTime = '' }) {
  const body = {
    from: String(from ?? '').trim(),
    to: numbers.map(toApiNumber).filter(Boolean),
    message: String(message ?? '').trim(),
    send_mode: when === 'later' ? 'later' : 'now',
  }

  if (body.send_mode === 'later') {
    body.scheduled_date = String(sendAt ?? '').slice(0, 10)
    body.scheduled_time = clockTime(sendTime)
  }

  return body
}

export function bulkSmsBody({ from, groups, message, when = 'now', sendAt = '', sendTime = '' }) {
  const body = {
    from: String(from ?? '').trim(),
    contact_group_ids: groups
      .map((group) => Number(group.id))
      .filter((id) => Number.isFinite(id) && id > 0),
    message: String(message ?? '').trim(),
    send_mode: when === 'later' ? 'later' : 'now',
  }

  if (body.send_mode === 'later') {
    body.scheduled_date = String(sendAt ?? '').slice(0, 10)
    body.scheduled_time = clockTime(sendTime)
  }

  return body
}

function deliveryFromApi(data) {
  const delivery = data?.delivery && typeof data.delivery === 'object' ? data.delivery : null
  const sent = delivery?.sent ?? data?.sent
  const delivered = delivery?.delivered ?? data?.delivered
  const failed = delivery?.failed ?? data?.failed
  const pending = delivery?.pending ?? data?.pending
  const deliveryRate = delivery?.delivery_rate ?? data?.delivery_rate
  return {
    ...(sent != null ? { sent: Number(sent) } : {}),
    ...(delivered != null ? { delivered: Number(delivered) } : {}),
    ...(failed != null ? { failed: Number(failed) } : {}),
    ...(pending != null ? { pending: Number(pending) } : {}),
    ...(deliveryRate != null && Number.isFinite(Number(deliveryRate))
      ? { deliveryRate: Number(deliveryRate) }
      : {}),
  }
}

function failureReasonsFromApi(data) {
  return (Array.isArray(data?.failure_reasons) ? data.failure_reasons : [])
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const code = String(row.code ?? '').trim()
      const label = String(row.label ?? '').trim()
      const count = Number(row.count)
      if (!code && !label) return null
      return {
        code,
        label: label || code,
        count: Number.isFinite(count) ? count : 0,
      }
    })
    .filter(Boolean)
}

function storedNumberFromApi(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length === 12) return `+${digits}`
  return toStoredNumber(raw) || String(raw ?? '')
}

export const recipientStatusOptions = [
  { id: 'delivered', label: 'Delivered' },
  { id: 'sent', label: 'Sent' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
]

export function smsRecipientFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.id == null) return null

  const groups = (Array.isArray(data.contact_groups) ? data.contact_groups : [])
    .filter((group) => group?.id != null)
    .map((group) => {
      const contact = group.contact && typeof group.contact === 'object' ? group.contact : null
      const firstName = contact?.first_name ?? contact?.firstName ?? ''
      const lastName = contact?.last_name ?? contact?.lastName ?? ''
      return {
        id: String(group.id),
        name: String(group.name ?? ''),
        contactName: [firstName, lastName].filter(Boolean).join(' ').trim(),
        firstName: String(firstName),
        lastName: String(lastName),
      }
    })

  const apiType = String(data.type ?? '').toLowerCase()
  return {
    id: String(data.id),
    inboxId: data.inbox_id == null ? '' : String(data.inbox_id),
    to: storedNumberFromApi(data.to),
    toRaw: String(data.to ?? ''),
    from: String(data.from ?? ''),
    body: String(data.message ?? ''),
    apiType,
    kind: apiType === 'bulk' ? 'groups' : 'numbers',
    requestType: data.request_type == null ? '' : String(data.request_type),
    messageId: data.message_id == null ? '' : String(data.message_id),
    status: String(data.status ?? '').toLowerCase() || '',
    failureReason: data.failure_reason == null ? '' : String(data.failure_reason),
    unitsUsed: readUnitField(data, 'units_used', 'unitsUsed') ?? 0,
    unitsRefunded: Boolean(data.units_refunded),
    groups,
    contactName: groups.map((group) => group.contactName).filter(Boolean).join(', '),
    sentAt: data.sent_at ? String(data.sent_at).replace(' ', 'T') : '',
    deliveredAt: data.delivered_at ? String(data.delivered_at).replace(' ', 'T') : '',
    createdAt: data.created_at ? String(data.created_at).replace(' ', 'T') : '',
  }
}

function readUnitField(data, ...keys) {
  if (!data || typeof data !== 'object') return null
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue
    const raw = data[key]
    if (raw == null || raw === '') continue
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return null
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
  const unitsBag = data.units && typeof data.units === 'object' && !Array.isArray(data.units) ? data.units : null

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
    sendAt: data.scheduled_at ? String(data.scheduled_at).replace(' ', 'T') : null,
    status: String(data.status ?? 'completed').toLowerCase() || 'completed',
    createdAt: data.created_at ? String(data.created_at).replace(' ', 'T') : '',
    completedAt: data.completed_at ? String(data.completed_at).replace(' ', 'T') : '',
    unitsUsed: readUnitField(data, 'units_used', 'unitsUsed') ?? readUnitField(unitsBag, 'used', 'units_used'),
    unitsRefunded:
      readUnitField(data, 'units_refunded', 'unitsRefunded') ?? readUnitField(unitsBag, 'refunded', 'units_refunded'),
    unitsNet: readUnitField(data, 'units_net', 'unitsNet') ?? readUnitField(unitsBag, 'net', 'units_net'),
    unitsBefore:
      readUnitField(data, 'units_before', 'unitsBefore', 'balance_before', 'balanceBefore') ??
      readUnitField(unitsBag, 'before', 'units_before', 'balance_before'),
    failureReasons: failureReasonsFromApi(data),
    failureSummary: data.failure_summary == null ? '' : String(data.failure_summary).trim(),
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
  if (Number.isFinite(message?.deliveryRate)) return `${message.deliveryRate}%`
  if (message?.delivered == null) return '—'
  const total = messageDeliveryTotal(message)
  if (!total) return '—'
  return `${((Number(message.delivered) / total) * 100).toFixed(1)}%`
}

export function messageFailureReasons(message) {
  return Array.isArray(message?.failureReasons) ? message.failureReasons : []
}

export function messageHasDelivery(message) {
  return message?.delivered != null || message?.sent != null || message?.failed != null || message?.pending != null
}

export function messageFailedCount(message) {
  const value = Number(message?.failed)
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function messageRecipientCount(message) {
  const recipients = Number(message?.recipients)
  if (Number.isFinite(recipients) && recipients > 0) return recipients
  return messageDeliveryTotal(message)
}

function messageIsSettled(message) {
  const status = String(message?.status ?? '').toLowerCase()
  return status !== 'queued' && status !== 'sending' && status !== 'processing'
}

/** Reblast: quick (message only) or bulk (target all/failed ± schedule). */
export function canReblastMessage(message) {
  if (!message?.id) return false
  if (String(message.status ?? '').toLowerCase() === 'cancelled') return false
  return messageIsSettled(message)
}

/** Resend: quick SMS with send_mode now/later. */
export function canResendMessage(message) {
  if (!message?.id || message.kind !== 'numbers') return false
  if (String(message.status ?? '').toLowerCase() === 'cancelled') return false
  return messageIsSettled(message)
}

/** Cancel only applies to scheduled messages that have not gone out yet. */
export function canCancelMessage(message) {
  if (!message?.id) return false
  return String(message.status ?? '').toLowerCase() === 'scheduled'
}

export function smsStatusFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.id == null) return null
  const counts = data.counts && typeof data.counts === 'object' ? data.counts : {}
  const units = data.units && typeof data.units === 'object' ? data.units : {}
  const apiType = String(data.type ?? '').toLowerCase()

  return {
    id: String(data.id),
    apiType,
    kind: apiType === 'bulk' ? 'groups' : 'numbers',
    sender: String(data.from ?? ''),
    messageId: data.message_id == null ? '' : String(data.message_id),
    status: String(data.status ?? '').toLowerCase() || '',
    scheduledAt: data.scheduled_at ? String(data.scheduled_at).replace(' ', 'T') : null,
    createdAt: data.created_at ? String(data.created_at).replace(' ', 'T') : '',
    completedAt: data.completed_at ? String(data.completed_at).replace(' ', 'T') : '',
    counts: {
      total: Number(counts.total_recipients) || 0,
      queued: Number(counts.queued) || 0,
      submitted: Number(counts.submitted) || 0,
      delivered: Number(counts.delivered) || 0,
      failed: Number(counts.failed) || 0,
      pending: Number(counts.pending) || 0,
      deliveryRate: Number(counts.delivery_rate),
    },
    units: {
      charged: Number(units.charged) || 0,
      refunded: Number(units.refunded) || 0,
      net: Number(units.net) || 0,
    },
  }
}

export function smsDeliveryReportFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const summary = data.summary && typeof data.summary === 'object' ? data.summary : {}
  const failures = data.failure_breakdown && typeof data.failure_breakdown === 'object' ? data.failure_breakdown : {}
  const pagination = data.pagination && typeof data.pagination === 'object' ? data.pagination : {}
  const apiType = String(data.type ?? '').toLowerCase()
  const contacts = (Array.isArray(data.contacts) ? data.contacts : [])
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      return {
        id: row.id == null ? undefined : String(row.id),
        to: storedNumberFromApi(row.to ?? row.phone_number ?? row.phone),
        toRaw: String(row.to ?? row.phone_number ?? row.phone ?? ''),
        status: String(row.status ?? '').toLowerCase(),
        failureReason: row.failure_reason == null ? '' : String(row.failure_reason),
        name: [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || String(row.name ?? ''),
      }
    })
    .filter(Boolean)

  return {
    smsId: data.sms_id == null ? '' : String(data.sms_id),
    apiType,
    kind: apiType === 'bulk' ? 'groups' : 'numbers',
    sender: String(data.from ?? ''),
    status: String(data.status ?? '').toLowerCase() || '',
    summary: {
      total: Number(summary.total_recipients) || 0,
      queued: Number(summary.queued) || 0,
      submitted: Number(summary.submitted) || 0,
      delivered: Number(summary.delivered) || 0,
      failed: Number(summary.failed) || 0,
      pending: Number(summary.pending) || 0,
      deliveryRate: Number(summary.delivery_rate),
    },
    failures: {
      undelivered: Number(failures.undelivered) || 0,
      rejected: Number(failures.rejected) || 0,
      expired: Number(failures.expired) || 0,
      notSent: Number(failures.not_sent) || 0,
    },
    contacts,
    page: Number(pagination.current_page) || 1,
    perPage: Number(pagination.per_page) || 50,
    total: Number(pagination.total) || contacts.length,
    lastPage: Number(pagination.last_page) || 1,
  }
}

export function defaultResendMessage(message) {
  return String(message?.body ?? '').trim()
}

export function defaultReblastMessage(message) {
  const body = String(message?.body ?? '').trim()
  if (!body) return 'Reblast'
  return body
}

function scheduledAtValue(sendAt, sendTime) {
  const day = String(sendAt ?? '').slice(0, 10)
  const time = clockTime(sendTime) || '00:00'
  return `${day} ${time}:00`
}

function withFrom(body, from) {
  const value = String(from ?? '').trim()
  if (value) body.from = value
  return body
}

/** Build POST /api/client/sms/:id/resend body (quick SMS). */
export function resendSmsBody({ message, from = '', when = 'now', sendAt = '', sendTime = '' }) {
  const body = withFrom(
    {
      message: String(message ?? '').trim(),
      send_mode: when === 'later' ? 'later' : 'now',
    },
    from,
  )
  if (body.send_mode === 'later') {
    body.scheduled_at = scheduledAtValue(sendAt, sendTime)
  }
  return body
}

/** Build POST /api/client/sms/:id/reblast body for quick or bulk scenarios. */
export function reblastSmsBody({
  kind,
  message,
  from = '',
  target = 'all',
  when = 'now',
  sendAt = '',
  sendTime = '',
}) {
  const text = String(message ?? '').trim()

  // Quick SMS: message + sender
  if (kind === 'numbers') {
    return withFrom({ message: text }, from)
  }

  // Bulk: failed recipients keep the original message
  if (target === 'failed') {
    return withFrom({ target: 'failed' }, from)
  }

  const body = withFrom({ target: 'all' }, from)

  if (when === 'later') {
    body.send_mode = 'later'
    body.scheduled_at = scheduledAtValue(sendAt, sendTime)
  } else if (text) {
    body.message = text
  }

  return body
}

export function reblastRecipientCount(message, target = 'all') {
  if (message?.kind === 'groups' && target === 'failed') return messageFailedCount(message)
  return messageRecipientCount(message)
}
