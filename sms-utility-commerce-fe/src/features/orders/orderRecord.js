function text(value) {
  if (value == null || value === '') return ''
  return String(value).trim()
}

export const orderStatuses = [
  { id: '', label: 'All statuses' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const itemTypeLabels = {
  sms_units: 'SMS units',
  wallet_top_up: 'Wallet top-up',
}

export function statusLabel(status) {
  const key = text(status)
  if (!key) return '—'
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export function itemTypeLabel(type) {
  const key = text(type).toLowerCase()
  if (!key) return '—'
  return itemTypeLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function metaFromApi(meta) {
  if (!meta || typeof meta !== 'object') return null
  const monthsRaw = meta.months
  const months = monthsRaw == null || monthsRaw === '' ? null : Number(monthsRaw)
  const unitsRaw = meta.units
  const units = unitsRaw == null || unitsRaw === '' ? null : Number(unitsRaw)

  return {
    type: text(meta.type).toLowerCase(),
    units: Number.isFinite(units) ? units : null,
    months: Number.isFinite(months) ? months : null,
    planId: meta.plan_id == null ? null : String(meta.plan_id),
    planName: text(meta.plan_name),
    raw: meta,
  }
}

export function orderItemFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null
  const type = text(data.type).toLowerCase()
  return {
    id: String(data.id),
    name: text(data.name) || 'Item',
    unitPrice: data.unit_price == null ? '' : String(data.unit_price),
    orderId: data.order_id == null ? null : String(data.order_id),
    orderCode: text(data.order_code),
    type,
    typeLabel: itemTypeLabel(type),
    meta: metaFromApi(data.meta_data),
    raw: data,
  }
}

export function orderSummary(items = []) {
  if (!items.length) return '—'
  if (items.length === 1) return items[0].name
  return `${items[0].name} +${items.length - 1} more`
}

export function orderFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null
  const items = (Array.isArray(data.items) ? data.items : []).map(orderItemFromApi).filter(Boolean)
  const quantity = data.quantity == null || data.quantity === '' ? null : Number(data.quantity)

  return {
    id: String(data.id),
    clientId: data.client_id == null ? null : String(data.client_id),
    adminId: data.admin_id == null ? null : String(data.admin_id),
    quantity: Number.isFinite(quantity) ? quantity : items.length || null,
    totalPrice: data.total_price == null ? '' : String(data.total_price),
    status: text(data.status).toLowerCase(),
    orderCode: text(data.order_code),
    items,
    summary: orderSummary(items),
    createdAt: text(data.created_at),
    raw: data,
  }
}
