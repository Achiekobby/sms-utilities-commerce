import { formatWalletAmount } from '../wallet/walletRecord'

export const rewardTypeOptions = [
  { id: '', label: 'All types' },
  { id: 'money', label: 'Cash' },
  { id: 'airtime', label: 'Airtime' },
  { id: 'data', label: 'Data' },
]

export const rewardStatusOptions = [
  { id: '', label: 'All statuses' },
  { id: 'instock', label: 'In stock' },
  { id: 'outofstock', label: 'Out of stock' },
]

const typeLabels = {
  money: 'Cash',
  cash: 'Cash',
  airtime: 'Airtime',
  data: 'Data',
}

const statusLabels = {
  instock: 'In stock',
  outofstock: 'Out of stock',
  active: 'Active',
  inactive: 'Inactive',
}

export function rewardTypeLabel(type) {
  return typeLabels[String(type ?? '').toLowerCase()] ?? (type ? String(type) : '—')
}

export function rewardStatusLabel(status) {
  return statusLabels[String(status ?? '').toLowerCase()] ?? (status ? String(status) : '—')
}

export function formatRewardPrice(amount, currency = 'GHS') {
  if (amount == null || amount === '') return '—'
  return formatWalletAmount(Number(amount).toFixed(2), currency || 'GHS')
}

export function rewardFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null
  const type = String(data.type ?? '').toLowerCase()
  return {
    id: String(data.id),
    name: String(data.name ?? '').trim() || 'Reward',
    type,
    typeLabel: rewardTypeLabel(type),
    size: data.size == null ? '' : String(data.size),
    amount: data.amount == null ? null : Number(data.amount),
    network: data.network == null ? '' : String(data.network),
    currency: String(data.currency ?? 'GHS').trim() || 'GHS',
    status: String(data.status ?? '').toLowerCase(),
    statusLabel: rewardStatusLabel(data.status),
    packageId: data.package_id == null ? '' : String(data.package_id),
    price: data.price == null ? Number(data.amount) || 0 : Number(data.price),
  }
}

export function rewardsCatalogFromApi(data) {
  if (!data || typeof data !== 'object') {
    return {
      currency: 'GHS',
      providerReachable: false,
      data: { categories: [], plans: [] },
      airtime: { networks: [], presets: [] },
      money: { currency: 'GHS', method: 'mobile_money' },
    }
  }

  const airtime = data.airtime && typeof data.airtime === 'object' ? data.airtime : {}
  const money = data.money && typeof data.money === 'object' ? data.money : {}
  const dataCatalog = data.data && typeof data.data === 'object' ? data.data : {}

  return {
    currency: String(data.currency ?? money.currency ?? 'GHS').trim() || 'GHS',
    providerReachable: data.provider_reachable === true,
    data: {
      categories: Array.isArray(dataCatalog.categories) ? dataCatalog.categories : [],
      plans: Array.isArray(dataCatalog.plans) ? dataCatalog.plans : [],
    },
    airtime: {
      networks: (Array.isArray(airtime.networks) ? airtime.networks : []).map((network) => ({
        code: String(network.code ?? '').trim(),
        name: String(network.name ?? network.code ?? '').trim(),
        minAmount: Number(network.min_amount) || 0,
        maxAmount: Number(network.max_amount) || 0,
      })),
      presets: (Array.isArray(airtime.presets) ? airtime.presets : []).map((value) => Number(value)).filter((value) => Number.isFinite(value)),
    },
    money: {
      currency: String(money.currency ?? data.currency ?? 'GHS').trim() || 'GHS',
      method: String(money.method ?? 'mobile_money').trim() || 'mobile_money',
    },
  }
}
