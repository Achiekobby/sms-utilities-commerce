import { apiErrorMessage } from '../auth/session'

export const ghanaRegions = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
]

export const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const photoTypes = ['image/jpeg', 'image/png', 'image/webp']
export const photoMaxBytes = 2 * 1024 * 1024

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const personNamePattern = /^[\p{L}][\p{L}\s.'’-]*$/u
const businessNamePattern = /^[\p{L}0-9][\p{L}0-9\s.'’&,-]*$/u
const cityPattern = /^[\p{L}][\p{L}\s.'’-]*$/u

const fieldNames = {
  account_type: 'accountType',
  first_name: 'firstName',
  last_name: 'lastName',
  phone_number: 'phone',
  date_of_birth: 'dateOfBirth',
  business_name: 'businessName',
  profile_image: 'profileImage',
  email: 'email',
  gender: 'gender',
  region: 'region',
  city: 'city',
  address: 'address',
}

const individualOrder = [
  ['accountType', 'Account type'],
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['email', 'Email address'],
  ['phone', 'Mobile number'],
  ['gender', 'Gender'],
  ['dateOfBirth', 'Date of birth'],
  ['region', 'Region'],
  ['city', 'City'],
  ['address', 'Address'],
  ['profileImage', 'Profile photo'],
]

const businessOrder = [
  ['accountType', 'Account type'],
  ['email', 'Email address'],
  ['phone', 'Mobile number'],
  ['businessName', 'Business name'],
  ['region', 'Region'],
  ['city', 'City'],
  ['address', 'Business address'],
  ['profileImage', 'Logo'],
]

export const emptyClient = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  region: '',
  city: '',
  address: '',
  businessName: '',
  profileImage: null,
}

export function todayIso(now = new Date()) {
  return isoDate(now)
}

export function adultCutoff(now = new Date()) {
  const date = new Date(now.getTime())
  date.setFullYear(date.getFullYear() - 18)
  return isoDate(date)
}

function isoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Keeps the field beside the +233 prefix. A pasted +233 or 233 number is reduced to the national digits.
export function phoneInput(raw) {
  const cleaned = String(raw ?? '').replace(/[^\d\s+]/g, '')
  const compact = cleaned.replace(/\s/g, '')
  if (compact.startsWith('+233')) return compact.slice(4)
  if (compact.startsWith('233') && compact.length >= 12) return compact.slice(3)
  return cleaned
}

// Posts the local Ghana number, for example 0241234567. Accepts 024…, 24…, or 23324….
export function toLocalPhone(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length >= 12) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.length === 9 ? `0${digits}` : ''
}

export function formatPhone(value) {
  const local = toLocalPhone(value)
  if (!local) return value ? String(value) : ''
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

function imageType(file) {
  if (photoTypes.includes(file.type)) return file.type
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg'
  if (extension === 'png') return 'image/png'
  if (extension === 'webp') return 'image/webp'
  return ''
}

export function photoError(file) {
  if (!(file instanceof File)) return ''
  if (!imageType(file)) return 'Use a JPG, PNG, or WebP image.'
  if (file.size === 0) return 'That file is empty. Choose a different image.'
  if (file.size > photoMaxBytes) return 'Use an image smaller than 2 MB.'
  return ''
}

function personNameError(value, label) {
  const name = value.trim()
  if (name.length < 2) return `Enter a ${label} of at least 2 characters.`
  if (name.length > 50) return `Use 50 characters or fewer for the ${label}.`
  if (!personNamePattern.test(name)) {
    return `Use letters in the ${label}. Spaces, hyphens, and apostrophes are fine.`
  }
  return ''
}

function dateOfBirthError(value, now = new Date()) {
  if (!value) return 'Enter a date of birth.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter a valid date of birth.'
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const real =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  if (!real) return 'Enter a valid date of birth.'
  if (value < '1900-01-01') return 'Enter a date of birth after 1900.'
  if (value > todayIso(now)) return 'Date of birth cannot be in the future.'
  if (value > adultCutoff(now)) return 'This client must be at least 18.'
  return ''
}

export function validateClient(accountType, values, now = new Date()) {
  if (accountType !== 'individual' && accountType !== 'business') {
    return { accountType: 'Choose individual or business.' }
  }

  const errors = {}
  const business = accountType === 'business'

  if (!business && accountType === 'individual') {
    const firstName = personNameError(values.firstName, 'first name')
    const lastName = personNameError(values.lastName, 'last name')
    if (firstName) errors.firstName = firstName
    if (lastName) errors.lastName = lastName
    if (!genders.some((item) => item.value === values.gender)) errors.gender = 'Select a gender.'
    const birth = dateOfBirthError(values.dateOfBirth, now)
    if (birth) errors.dateOfBirth = birth
  }

  const email = values.email.trim()
  if (!email) errors.email = 'Enter an email address.'
  else if (email.length > 120) errors.email = 'Use 120 characters or fewer for the email.'
  else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address, for example thomas@example.com.'

  if (!values.phone.trim()) errors.phone = 'Enter a mobile number.'
  else if (!toLocalPhone(values.phone)) errors.phone = 'Enter a Ghana number, for example 024 123 4567.'

  if (business) {
    const businessName = values.businessName.trim()
    if (businessName.length < 2) errors.businessName = 'Enter the business name.'
    else if (businessName.length > 80) errors.businessName = 'Use 80 characters or fewer for the business name.'
    else if (!businessNamePattern.test(businessName)) {
      errors.businessName = 'Use letters or numbers in the business name.'
    }
  }

  if (accountType === 'individual' || business) {
    if (!ghanaRegions.includes(values.region)) errors.region = 'Select a region in Ghana.'
    const city = values.city.trim()
    if (city.length < 2) errors.city = 'Enter a city.'
    else if (city.length > 40) errors.city = 'Use 40 characters or fewer for the city.'
    else if (!cityPattern.test(city)) errors.city = 'Use letters in the city name.'

    const address = values.address.trim()
    if (address.length < 5) {
      errors.address = business ? 'Enter the business address.' : 'Enter the street address.'
    } else if (address.length > 120) {
      errors.address = 'Use 120 characters or fewer for the address.'
    } else if (!/[\p{L}\p{N}]/u.test(address)) {
      errors.address = 'Enter a street address.'
    }
  }

  const photo = photoError(values.profileImage)
  if (photo) errors.profileImage = photo

  return errors
}

export function errorItems(accountType, errors) {
  const order = accountType === 'business' ? businessOrder : individualOrder
  return order.filter(([key]) => errors[key]).map(([key, label]) => ({ key, label, message: errors[key] }))
}

export function sectionStatus(accountType, values) {
  const errors = validateClient(accountType, values)
  const business = accountType === 'business'
  const contact = !errors.email && !errors.phone
  const identity = business
    ? !errors.businessName && values.businessName.trim().length >= 2
    : !errors.firstName && !errors.lastName && !errors.gender && !errors.dateOfBirth
  const location = !errors.region && !errors.city && !errors.address
  return {
    contact,
    identity,
    location,
    photo: values.profileImage instanceof File && !errors.profileImage,
  }
}

export function clientUpdateBody(accountType, values) {
  const body = new FormData()
  body.append('email', values.email.trim().toLowerCase())
  body.append('phone_number', toLocalPhone(values.phone))
  body.append('region', values.region)
  body.append('city', values.city.trim())
  body.append('address', values.address.trim())

  if (accountType === 'business') {
    body.append('business_name', values.businessName.trim())
  } else {
    body.append('first_name', values.firstName.trim())
    body.append('last_name', values.lastName.trim())
    body.append('gender', values.gender)
    body.append('date_of_birth', values.dateOfBirth)
  }

  if (values.profileImage instanceof File) body.append('profile_image', values.profileImage)
  return body
}

export function onboardBody(accountType, values) {
  const body = new FormData()
  body.append('account_type', accountType)
  body.append('email', values.email.trim().toLowerCase())
  body.append('phone_number', toLocalPhone(values.phone))
  body.append('region', values.region)
  body.append('city', values.city.trim())
  body.append('address', values.address.trim())

  if (accountType === 'business') {
    body.append('business_name', values.businessName.trim())
  } else {
    body.append('first_name', values.firstName.trim())
    body.append('last_name', values.lastName.trim())
    body.append('gender', values.gender)
    body.append('date_of_birth', values.dateOfBirth)
  }

  if (values.profileImage instanceof File) body.append('profile_image', values.profileImage)
  return body
}

function envelopeOf(error) {
  return error?.data && typeof error.data === 'object' ? error.data : null
}

function messageOf(value) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (!Array.isArray(value)) return ''
  const found = value.find((item) => typeof item === 'string' && item.trim())
  return found ? found.trim() : ''
}

function isErrorBag(source) {
  const values = Object.values(source)
  if (!values.length) return false
  return values.every((value) => {
    if (typeof value === 'string') return true
    return Array.isArray(value) && value.every((item) => typeof item === 'string')
  })
}

export function onboardingErrors(error) {
  const envelope = envelopeOf(error)
  const source = envelope?.errors ?? envelope?.data
  const fields = {}

  if (source && !Array.isArray(source) && typeof source === 'object' && isErrorBag(source)) {
    for (const [key, value] of Object.entries(source)) {
      const message = messageOf(value)
      const name = fieldNames[key]
      if (!message || !name) continue
      fields[name] = message
    }
  }

  return {
    fields,
    formError: Object.keys(fields).length ? '' : apiErrorMessage(error),
  }
}

export function displayName(client) {
  if (!client || typeof client !== 'object') return 'Client'
  if (client.account_type === 'business') return client.business_name || 'Business client'
  const name = `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()
  return name || 'Individual client'
}

export function formatWhen(value) {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
