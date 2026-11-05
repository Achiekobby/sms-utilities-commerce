import Images from '../../utils/Images'

const dayStamp = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const networkLabels = {
  mtn: 'MTN',
  telecel: 'Telecel',
  at: 'AT',
}

const methodLabels = {
  momo: 'Mobile money',
}

export const walletNetworks = [
  { id: 'mtn', label: 'MTN', image: Images.mtn },
  { id: 'telecel', label: 'Telecel', image: Images.telecel },
  { id: 'at', label: 'AT', image: Images.at },
]
export const walletMethods = [{ id: 'momo', label: 'Mobile money' }]

export function formatWalletAmount(amount, currency = '') {
  const raw = String(amount ?? '').trim()
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return '—'
  const negative = raw.startsWith('-')
  const [whole, frac = ''] = raw.replace('-', '').split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const cents = `${frac}00`.slice(0, 2)
  const code = String(currency ?? '').trim()
  return `${negative ? '-' : ''}${code ? `${code} ` : ''}${grouped}.${cents}`
}

export function walletFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null
  return {
    id: String(data.id),
    status: String(data.status ?? '').toLowerCase(),
    balance: data.balance == null ? '' : String(data.balance),
    currency: String(data.currency ?? '').trim(),
  }
}

function text(value) {
  if (value == null || value === '') return ''
  return String(value)
}

export function topUpFromApi(data) {
  if (!data || typeof data !== 'object') return null
  const id = data.id ?? data.reference ?? data.created_at
  if (id == null) return null

  const network = text(data.network)
  const method = text(data.method ?? data.payment_method)
  const status = text(data.status).toLowerCase()

  return {
    id: String(id),
    amount: data.amount == null ? '' : String(data.amount),
    currency: text(data.currency),
    network,
    networkLabel: networkLabels[network] || network,
    method,
    methodLabel: methodLabels[method] || method,
    status,
    createdAt: text(data.created_at ?? data.createdAt),
    reference: text(data.reference),
    nextUrl: text(data.authorization_url ?? data.checkout_url ?? data.payment_url),
  }
}

export function formatTopUpDay(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return value ? String(value) : '—'
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return dayStamp.format(date)
}

export function statusLabel(status) {
  if (!status) return '—'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function parseTopUpAmount(raw) {
  const value = String(raw ?? '').trim()
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}
