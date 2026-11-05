function envelopeOf(error) {
  return error?.data && typeof error.data === 'object' ? error.data : null
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

export function pendingFromOtp(data, email) {
  return {
    email: data?.email || email,
    type: 'login',
    channel: data?.channel || 'email',
    expiresAt: data?.expires_at ?? null,
  }
}

const profileFields = {
  first_name: 'firstName',
  last_name: 'lastName',
  phone_number: 'phoneNumber',
  profile_image: 'profileImage',
  email: 'email',
}

export function fieldErrors(error) {
  const envelope = envelopeOf(error)
  const source = envelope?.errors ?? envelope?.data
  if (!source || Array.isArray(source) || typeof source !== 'object') return {}

  const errors = {}
  for (const [key, messages] of Object.entries(source)) {
    const message = Array.isArray(messages) ? messages.find((item) => typeof item === 'string' && item) : null
    if (!message) continue
    errors[profileFields[key] ?? key] = message
  }
  return errors
}

export function adminFromProfile(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const role = data.role && typeof data.role === 'object' ? data.role : null

  return {
    id: data.id,
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    email: data.email ?? '',
    phoneNumber: data.phone_number ?? null,
    status: data.status ?? '',
    profileImage: data.profile_image ?? null,
    lastLoginAt: data.last_login_at ?? null,
    role: role
      ? {
          id: role.id,
          name: role.name ?? '',
          description: role.description ?? '',
          permissions: Array.isArray(role.permissions) ? role.permissions : [],
        }
      : null,
  }
}

export function sessionFromVerification(data) {
  const user = adminFromProfile(data)
  if (!data?.access_token || !user) return null

  return {
    token: data.access_token,
    tokenType: data.token_type || 'Bearer',
    expiresAt: data.expires_at ?? null,
    user,
  }
}

export function adminName(user) {
  const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  return name || user?.email || 'Admin'
}
