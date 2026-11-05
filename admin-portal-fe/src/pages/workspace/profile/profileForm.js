const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const photoTypes = ['image/jpeg', 'image/png', 'image/webp']
const photoMaxBytes = 2 * 1024 * 1024

export function formFromProfile(profile) {
  return {
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    email: profile?.email ?? '',
    phoneNumber: profile?.phone_number ?? '',
    photo: null,
  }
}

export function profileBody(values) {
  const body = new FormData()
  body.append('first_name', values.firstName.trim())
  body.append('last_name', values.lastName.trim())
  body.append('email', values.email.trim().toLowerCase())
  body.append('phone_number', values.phoneNumber.trim())
  if (values.photo instanceof File) body.append('profile_image', values.photo)
  return body
}

export function isProfileDirty(values, saved) {
  if (!saved) return false
  if (values.photo instanceof File) return true
  return ['firstName', 'lastName', 'email', 'phoneNumber'].some(
    (key) => values[key].trim() !== String(saved[key] ?? '').trim(),
  )
}

export function validateProfile(values) {
  const errors = {}
  if (!values.firstName.trim()) errors.firstName = 'Enter your first name.'
  if (!values.lastName.trim()) errors.lastName = 'Enter your last name.'
  if (!emailPattern.test(values.email.trim())) errors.email = 'Enter a valid email address.'

  const phone = values.phoneNumber.trim()
  if (phone) {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 15) errors.phoneNumber = 'Enter a valid phone number.'
  }

  const photo = values.photo
  if (photo instanceof File && !photoTypes.includes(photo.type)) errors.profileImage = 'Use a JPG, PNG, or WebP photo.'
  else if (photo instanceof File && photo.size > photoMaxBytes) errors.profileImage = 'Use a photo smaller than 2 MB.'

  return errors
}

export function formatStamp(value) {
  if (!value) return '—'
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

export function statusLabel(status) {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
