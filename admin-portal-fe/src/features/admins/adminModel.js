import { apiErrorMessage } from '../auth/session'
import { formatPhone, phoneInput, photoError, toLocalPhone } from '../onboarding/clientOnboarding'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const personNamePattern = /^[\p{L}][\p{L}\s.'’-]*$/u

const fieldNames = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  phone_number: 'phone',
  role_id: 'roleId',
  profile_image: 'profileImage',
}

export const emptyAdmin = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roleId: '',
  profileImage: null,
}

export function adminName(admin) {
  const name = `${admin?.first_name ?? ''} ${admin?.last_name ?? ''}`.trim()
  return name || admin?.email || 'Admin'
}

export function adminInitials(admin) {
  const parts = adminName(admin).split(/\s+/).filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`
  return letters.toUpperCase() || 'A'
}

export function sameAdmin(left, right) {
  if (left == null || right == null) return false
  return String(left) === String(right)
}

export function valuesFromAdmin(admin) {
  return {
    firstName: admin?.first_name ?? '',
    lastName: admin?.last_name ?? '',
    email: admin?.email ?? '',
    phone: toLocalPhone(admin?.phone_number) || phoneInput(admin?.phone_number ?? ''),
    roleId: admin?.role?.id != null ? String(admin.role.id) : '',
    profileImage: null,
  }
}

function nameError(value, label) {
  const name = String(value ?? '').trim()
  if (name.length < 2) return `Enter a ${label} of at least 2 characters.`
  if (name.length > 50) return `Use 50 characters or fewer for the ${label}.`
  if (!personNamePattern.test(name)) return `Use letters in the ${label}. Spaces, hyphens, and apostrophes are fine.`
  return ''
}

export function validateAdmin(values, { requireRole = false } = {}) {
  const errors = {}
  const firstName = nameError(values.firstName, 'first name')
  const lastName = nameError(values.lastName, 'last name')
  if (firstName) errors.firstName = firstName
  if (lastName) errors.lastName = lastName

  const email = String(values.email ?? '').trim()
  if (!email) errors.email = 'Enter an email address.'
  else if (email.length > 255) errors.email = 'Use 255 characters or fewer for the email.'
  else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.'

  if (!toLocalPhone(values.phone)) errors.phone = 'Enter a Ghana mobile number, for example 024 123 4567.'
  if (requireRole && !values.roleId) errors.roleId = 'Choose a role for this admin.'

  const photo = photoError(values.profileImage)
  if (photo) errors.profileImage = photo
  return errors
}

function appendIdentity(body, values) {
  body.append('first_name', values.firstName.trim())
  body.append('last_name', values.lastName.trim())
  body.append('email', values.email.trim())
  body.append('phone_number', toLocalPhone(values.phone))
  if (values.profileImage instanceof File) body.append('profile_image', values.profileImage)
}

export function onboardAdminBody(values) {
  const body = new FormData()
  appendIdentity(body, values)
  body.append('role_id', String(values.roleId))
  return body
}

export function adminUpdateBody(values) {
  const body = new FormData()
  appendIdentity(body, values)
  return body
}

export function adminDirty(values, baseline) {
  if (values.profileImage instanceof File) return true
  return (
    values.firstName.trim() !== baseline.firstName.trim() ||
    values.lastName.trim() !== baseline.lastName.trim() ||
    values.email.trim() !== baseline.email.trim() ||
    toLocalPhone(values.phone) !== toLocalPhone(baseline.phone)
  )
}

export function adminMatches(admin, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const phone = String(admin?.phone_number ?? '')
  const phones = [phone, toLocalPhone(phone), formatPhone(phone)].join(' ').toLowerCase().replace(/\s/g, '')
  const text = [adminName(admin), admin?.email, admin?.role?.name].filter(Boolean).join(' ').toLowerCase()
  return text.includes(needle) || phones.includes(needle.replace(/\s/g, ''))
}

function messageOf(value) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value)) {
    const found = value.find((item) => typeof item === 'string' && item.trim())
    return found ? found.trim() : ''
  }
  return ''
}

function isErrorBag(source) {
  return Object.values(source).every((value) => {
    if (typeof value === 'string') return true
    return Array.isArray(value) && value.every((item) => typeof item === 'string')
  })
}

export function adminFieldErrors(error) {
  const envelope = error?.data && typeof error.data === 'object' ? error.data : null
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

export function withCurrentRole(roles, current) {
  const list = Array.isArray(roles) ? roles : []
  if (current?.id == null) return list
  if (list.some((role) => String(role.id) === String(current.id))) return list
  return [current, ...list]
}
