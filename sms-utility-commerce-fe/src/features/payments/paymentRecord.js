function text(value) {
  if (value == null || value === '') return ''
  return String(value).trim()
}

export const paymentStatuses = [
  { id: '', label: 'All statuses' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
  { id: 'cancelled', label: 'Cancelled' },
]

export const paymentPurposes = [
  { id: '', label: 'All purposes' },
  { id: 'sms_units', label: 'SMS units' },
  { id: 'wallet_top_up', label: 'Wallet top-up' },
]

const purposeLabels = Object.fromEntries(paymentPurposes.filter((row) => row.id).map((row) => [row.id, row.label]))

const methodLabels = {
  momo: 'Mobile money',
  card: 'Card',
  bank: 'Bank',
}

const networkLabels = {
  mtn: 'MTN',
  telecel: 'Telecel',
  at: 'AT',
  vodafone: 'Vodafone',
}

export function purposeLabel(purpose) {
  const key = text(purpose).toLowerCase()
  if (!key) return '—'
  return purposeLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function methodLabel(method) {
  const key = text(method).toLowerCase()
  if (!key) return '—'
  return methodLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function networkLabel(network) {
  const key = text(network).toLowerCase()
  if (!key) return '—'
  return networkLabels[key] || text(network).toUpperCase()
}

export function statusLabel(status) {
  const key = text(status)
  if (!key) return '—'
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export function paymentFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null

  const method = text(data.method).toLowerCase()
  const network = text(data.network)
  const status = text(data.status).toLowerCase()
  const purpose = text(data.purpose).toLowerCase()

  return {
    id: String(data.id),
    resource: text(data.resource),
    clientId: data.client_id == null ? null : String(data.client_id),
    orderId: data.order_id == null ? null : String(data.order_id),
    referenceId: text(data.reference_id),
    purpose,
    purposeLabel: purposeLabel(purpose),
    method,
    methodLabel: methodLabel(method),
    network,
    networkLabel: networkLabel(network),
    msisdn: text(data.msisdn),
    amount: data.amount == null ? '' : String(data.amount),
    charge: data.charge == null ? '' : String(data.charge),
    totalAmount: data.total_amount == null ? '' : String(data.total_amount),
    currency: text(data.currency) || 'GHS',
    status,
    paymentLink: text(data.payment_link),
    failureReason: text(data.failure_reason),
    paidAt: text(data.paid_at),
    createdAt: text(data.created_at),
    raw: data,
  }
}
