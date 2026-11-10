import guideData from './guideData'

export const senderIdMax = 11

export function senderIdError(value) {
  const raw = String(value ?? '')
  const trimmed = raw.trim()

  if (!trimmed) return 'Sender ID is required.'
  if (/^\s/.test(raw)) return 'Sender ID must start with a letter.'
  if (/\s$/.test(raw)) return 'Remove the space at the end.'
  if (trimmed.length > senderIdMax) return 'Sender ID must be 11 characters or fewer.'
  if (!/^[A-Za-z]/.test(trimmed)) return 'Sender ID must start with a letter.'
  if (/ {2,}/.test(trimmed)) return 'Use a single space between words.'
  if (!/^[A-Za-z0-9 ]+$/.test(trimmed)) return 'Only letters, numbers, and spaces are allowed.'
  if (!/[A-Za-z]/.test(trimmed)) return 'Sender ID must start with a letter.'

  return ''
}

export function validationGuide(overrides = guideData) {
  return overrides
}
