export const senderIdMax = 11

const allowed = /^[A-Za-z0-9 _-]*$/

export function senderIdError(value, names = []) {
  if (!value) return 'Enter a sender ID.'
  if (value.length > senderIdMax) return 'Keep it within 11 characters. Spaces count.'
  if (!allowed.test(value)) return 'Use letters, numbers, spaces, hyphens, and underscores only.'
  if (!/^[A-Za-z]/.test(value)) return 'Start with a letter.'
  if (/\s$/.test(value)) return 'Remove the space at the end.'

  const name = value.toUpperCase()
  if (names.some((item) => item.toUpperCase() === name)) return 'This sender ID is already in your workspace.'
  return ''
}
