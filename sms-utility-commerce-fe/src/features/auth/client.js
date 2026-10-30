import { toLocalPhone } from './validation'

const fieldNames = {
  first_name: 'firstName',
  last_name: 'lastName',
  phone_number: 'phone',
  date_of_birth: 'dateOfBirth',
  profile_image: 'profileImage',
  business_name: 'businessName',
  account_type: 'accountType',
}

const unverifiedReasons = new Set([
  'unverified',
  'not_verified',
  'account_unverified',
  'account_not_verified',
  'verification_required',
  'pending_verification',
])

export function individualSignupBody(values) {
  const body = new FormData()
  body.append('account_type', 'individual')
  body.append('email', values.email.trim().toLowerCase())
  body.append('phone_number', toLocalPhone(values.phone))
  body.append('gender', values.gender)
  body.append('first_name', values.firstName.trim())
  body.append('last_name', values.lastName.trim())
  body.append('date_of_birth', values.dateOfBirth)
  body.append('region', values.region)
  body.append('city', values.city.trim())
  body.append('address', values.address.trim())
  if (values.profileImage) body.append('profile_image', values.profileImage)
  return body
}

export function businessSignupBody(values) {
  const body = new FormData()
  body.append('account_type', 'business')
  body.append('email', values.email.trim().toLowerCase())
  body.append('phone_number', toLocalPhone(values.phone))
  body.append('business_name', values.businessName.trim())
  body.append('region', values.region)
  body.append('city', values.city.trim())
  body.append('address', values.address.trim())
  if (values.profileImage) body.append('profile_image', values.profileImage)
  return body
}

export function individualProfileBody(values) {
  const body = new FormData()
  body.append('email', values.email.trim().toLowerCase())
  body.append('phone_number', toLocalPhone(values.phone))
  body.append('gender', values.gender)
  body.append('first_name', values.firstName.trim())
  body.append('last_name', values.lastName.trim())
  body.append('date_of_birth', values.dateOfBirth)
  body.append('region', values.region)
  body.append('city', values.city.trim())
  body.append('address', values.address.trim())
  if (values.profileImage instanceof File) body.append('profile_image', values.profileImage)
  return body
}

export function businessProfileBody(values) {
  const body = new FormData()
  body.append('email', values.email.trim().toLowerCase())
  body.append('phone_number', toLocalPhone(values.phone))
  body.append('business_name', values.businessName.trim())
  body.append('region', values.region)
  body.append('city', values.city.trim())
  body.append('address', values.address.trim())
  if (values.profileImage instanceof File) body.append('profile_image', values.profileImage)
  return body
}

export function profileBody(isBusiness, values) {
  return isBusiness ? businessProfileBody(values) : individualProfileBody(values)
}

export function signupBody(accountType, values) {
  return accountType === 'business' ? businessSignupBody(values) : individualSignupBody(values)
}

export function clientFromApi(data) {
  return {
    id: data.id,
    identifier: data.email,
    provider: 'passwordless',
    accountType: data.account_type,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone_number,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    businessName: data.business_name,
    region: data.region,
    city: data.city,
    address: data.address,
    status: data.status,
    profileImage: data.profile_image,
    onboardingType: data.onboarding_type,
    lastLoginAt: data.last_login_at,
    verifiedAt: data.verified_at,
    isVerified: data.is_verified === true,
    wallet: data.wallet ?? null,
    subscription: data.subscription ?? null,
  }
}

export function sessionFromVerification(data) {
  return {
    user: clientFromApi(data),
    token: data.access_token,
    verified: data.is_verified === true,
  }
}

export function verificationFrom(data, type, email) {
  return {
    email: data?.email || email,
    type,
    channel: data?.channel || 'email',
    expiresAt: data?.expires_at ?? null,
  }
}

function envelopeOf(error) {
  return error?.data && typeof error.data === 'object' ? error.data : null
}

export function fieldErrors(error) {
  const source = envelopeOf(error)?.data
  if (!source || Array.isArray(source) || typeof source !== 'object') return {}

  return Object.fromEntries(
    Object.entries(source).map(([key, messages]) => [
      fieldNames[key] ?? key,
      Array.isArray(messages) ? messages[0] : String(messages),
    ]),
  )
}

export function apiErrorMessage(error) {
  if (error?.status === 'FETCH_ERROR') {
    return 'We could not reach the server. Check your connection and try again.'
  }

  const envelope = envelopeOf(error)
  if (!envelope || envelope.exception || envelope.trace) return 'Something went wrong. Try again.'
  if (envelope.reason === 'too_many_requests') return 'Too many attempts. Wait a moment, then try again.'
  const message = typeof envelope.message === 'string' ? envelope.message : ''
  if (message && message !== 'Validation failed.' && message.length < 180) return message
  return 'Check the details and try again.'
}

export function isUnverifiedAccount(error) {
  const envelope = envelopeOf(error)
  if (!envelope) return false
  if (unverifiedReasons.has(envelope.reason)) return true
  return /unverified|not verified|verify your (email|account)|verification required/i.test(
    String(envelope.message ?? ''),
  )
}
