import { displayName, formatPhone, formatWhen, ghanaRegions, toLocalPhone, validateClient } from '../onboarding/clientOnboarding'

export { displayName as clientName, formatPhone, formatWhen }

export function clientInitials(client) {
  const parts = displayName(client).split(/\s+/).filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`
  return letters.toUpperCase() || 'C'
}

export function personName(person) {
  if (!person || typeof person !== 'object') return ''
  const name = `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim()
  return name || person.email || ''
}

export function labelize(value) {
  if (!value) return ''
  const text = String(value).replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatDate(value) {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value))
  if (!match) return String(value)
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function money(amount, currency = 'GHS') {
  if (amount == null || amount === '') return ''
  const number = Number(amount)
  if (!Number.isFinite(number)) return `${currency} ${amount}`
  return `${currency} ${number.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function monthSpan(months) {
  const count = Number(months)
  if (!Number.isFinite(count) || count <= 0) return ''
  return count === 1 ? '1 month' : `${count} months`
}

export const emptyClientFilters = {
  accountType: '',
  status: '',
  verified: '',
  onboarding: '',
  region: '',
}

export function activeFilterCount(filters) {
  return Object.values(filters).filter(Boolean).length
}

export function describeClientFilters(filters) {
  const chips = []
  if (filters.accountType) chips.push({ key: 'accountType', label: filters.accountType === 'business' ? 'Business' : 'Individual' })
  if (filters.status) chips.push({ key: 'status', label: labelize(filters.status) })
  if (filters.verified) chips.push({ key: 'verified', label: filters.verified === 'verified' ? 'Verified' : 'Unverified' })
  if (filters.onboarding) chips.push({ key: 'onboarding', label: filters.onboarding === 'admin' ? 'Onboarded by admin' : 'Signed up themselves' })
  if (filters.region) chips.push({ key: 'region', label: filters.region })
  return chips
}

export function clientMatchesFilters(client, filters) {
  if (!filters) return true
  if (filters.accountType && client.account_type !== filters.accountType) return false
  if (filters.status && client.status !== filters.status) return false
  if (filters.verified === 'verified' && !client.is_verified) return false
  if (filters.verified === 'unverified' && client.is_verified) return false
  if (filters.onboarding === 'admin' && client.onboarding_type !== 'admin') return false
  if (filters.onboarding === 'self' && client.onboarding_type === 'admin') return false
  if (filters.region && client.region !== filters.region) return false
  return true
}

export function clientMatches(client, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    displayName(client),
    client.email,
    client.phone_number,
    formatPhone(client.phone_number),
    client.city,
    client.region,
    client.address,
    client.business_name,
    client.account_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

export function valuesFromClient(client) {
  const phone = toLocalPhone(client?.phone_number)
  const birth = String(client?.date_of_birth ?? '')
  return {
    firstName: client?.first_name ?? '',
    lastName: client?.last_name ?? '',
    email: client?.email ?? '',
    phone: phone || '',
    gender: client?.gender ?? '',
    dateOfBirth: /^\d{4}-\d{2}-\d{2}/.test(birth) ? birth.slice(0, 10) : '',
    region: client?.region ?? '',
    city: client?.city ?? '',
    address: client?.address ?? '',
    businessName: client?.business_name ?? '',
    profileImage: null,
  }
}

export function validateClientEdit(accountType, values, saved) {
  const found = { ...validateClient(accountType, values) }
  if (found.region && values.region === saved?.region && !ghanaRegions.includes(values.region)) delete found.region
  return found
}

export function isClientDirty(accountType, values, saved) {
  if (!saved) return false
  if (values.profileImage instanceof File) return true
  if (toLocalPhone(values.phone) !== toLocalPhone(saved.phone)) return true
  const keys =
    accountType === 'business'
      ? ['email', 'businessName', 'region', 'city', 'address']
      : ['firstName', 'lastName', 'email', 'gender', 'dateOfBirth', 'region', 'city', 'address']
  return keys.some((key) => String(values[key] ?? '').trim() !== String(saved[key] ?? '').trim())
}

export function pageWindow(pagination) {
  const total = Number(pagination?.total) || 0
  const current = Number(pagination?.current_page) || 1
  const perPage = Number(pagination?.per_page) || 15
  if (!total) return { from: 0, to: 0, total, current, perPage, lastPage: Number(pagination?.last_page) || 1 }
  const from = (current - 1) * perPage + 1
  const to = Math.min(current * perPage, total)
  return { from, to, total, current, perPage, lastPage: Number(pagination?.last_page) || 1 }
}
