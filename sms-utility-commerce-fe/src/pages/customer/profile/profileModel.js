import { countryCode, emailPattern, toPhoneIdentifier } from '../../../features/auth/validation'

const personKeys = ['firstName', 'lastName', 'email', 'phone']
const businessKeys = ['businessName', 'address']

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
    businessName: user?.businessName ?? '',
    address: user?.address ?? '',
  }
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
  const keys = isBusiness ? [...personKeys, ...businessKeys] : personKeys
  return keys.some((key) => normalize(key, current[key]) !== normalize(key, saved[key]))
}

export function validateProfile(isBusiness, values) {
  const errors = {}
  const trimmed = (key) => values[key].trim()

  if (trimmed('firstName').length < 2) errors.firstName = 'Enter your first name.'
  if (trimmed('lastName').length < 2) errors.lastName = 'Enter your last name.'
  if (!emailPattern.test(trimmed('email'))) errors.email = 'Enter a valid email address.'
  if (!toPhoneIdentifier(values.phone)) errors.phone = 'Enter a valid number, for example 024 123 4567.'

  if (isBusiness) {
    if (trimmed('businessName').length < 2) errors.businessName = 'Enter your business name.'
    if (trimmed('address').length < 5) errors.address = 'Enter your business address.'
  }

  return errors
}

export function profilePayload(isBusiness, values) {
  const payload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: toPhoneIdentifier(values.phone),
  }

  if (isBusiness) {
    payload.businessName = values.businessName.trim()
    payload.address = values.address.trim()
  }

  return payload
}
