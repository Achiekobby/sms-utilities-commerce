import { countryCode, toPhoneIdentifier } from '../../../features/auth/validation'

const photoTypes = ['image/jpeg', 'image/png', 'image/webp']
const photoMaxBytes = 2 * 1024 * 1024

const locationKeys = ['region', 'city', 'address']
const individualKeys = ['firstName', 'lastName', 'phone', 'gender', 'dateOfBirth', ...locationKeys]
const businessKeys = ['businessName', 'phone', ...locationKeys]

export function nationalPhone(stored) {
  if (!stored) return ''
  const digits = String(stored).replace(/\D/g, '')
  const local = digits.startsWith('233') ? digits.slice(3) : digits.replace(/^0/, '')
  if (local.length !== 9) return local
  return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
}

export function displayPhone(stored) {
  const national = nationalPhone(stored)
  return national ? `${countryCode} ${national}` : 'Not added'
}

export function profileFromUser(user) {
  const identifier = user?.identifier ?? ''
  const identifierIsEmail = identifier.includes('@')

  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email || (identifierIsEmail ? identifier : ''),
    phone: nationalPhone(user?.phone || (!identifierIsEmail ? identifier : '')),
    gender: user?.gender ?? '',
    dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
    region: user?.region ?? '',
    city: user?.city ?? '',
    businessName: user?.businessName ?? '',
    address: user?.address ?? '',
  }
}

export function formatProfileDate(value) {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatMoney(amount, currency = 'GHS') {
  const number = Number(amount)
  if (!Number.isFinite(number)) return '—'
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(number)
}

export function signInLabel(user) {
  return user?.provider === 'google' ? 'Google' : 'Email code'
}

function normalize(key, value) {
  if (key === 'email') return value.trim().toLowerCase()
  if (key === 'phone') return toPhoneIdentifier(value) ?? value.replace(/\D/g, '')
  return value.trim()
}

export function isProfileDirty(current, saved, isBusiness) {
  const keys = isBusiness ? businessKeys : individualKeys
  return keys.some((key) => normalize(key, current[key] ?? '') !== normalize(key, saved[key] ?? ''))
}

export function validateProfile(isBusiness, values) {
  const errors = {}
  const trimmed = (key) => values[key].trim()

  if (!isBusiness) {
    if (trimmed('firstName').length < 2) errors.firstName = 'Enter your first name.'
    if (trimmed('lastName').length < 2) errors.lastName = 'Enter your last name.'
    if (!values.gender) errors.gender = 'Select a gender.'
    if (!values.dateOfBirth) errors.dateOfBirth = 'Enter your date of birth.'
  }

  if (!toPhoneIdentifier(values.phone)) errors.phone = 'Enter a valid number, for example 024 123 4567.'
  if (!values.region) errors.region = 'Select your region.'
  if (trimmed('city').length < 2) errors.city = 'Enter your city.'
  if (trimmed('address').length < 5) errors.address = isBusiness ? 'Enter your business address.' : 'Enter your address.'

  if (isBusiness && trimmed('businessName').length < 2) errors.businessName = 'Enter your business name.'

  const photo = values.profileImage
  if (photo instanceof File && !photoTypes.includes(photo.type)) errors.profileImage = 'Use a JPG, PNG, or WebP photo.'
  else if (photo instanceof File && photo.size > photoMaxBytes) errors.profileImage = 'Use a photo smaller than 2 MB.'

  return errors
}
