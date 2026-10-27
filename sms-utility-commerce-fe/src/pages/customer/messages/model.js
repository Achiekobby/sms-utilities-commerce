export const messageKinds = [
  {
    id: 'numbers',
    label: 'To numbers',
    hint: 'Type the mobile numbers, separated by commas.',
  },
  {
    id: 'groups',
    label: 'To groups',
    hint: 'Choose one or more contact groups. Only active contacts are included.',
  },
]

export const maxNumbers = 500

export function kindLabel(kind) {
  return messageKinds.find((item) => item.id === kind)?.label ?? kind
}

// Accepts 024 123 4567, 24 123 4567, or +233 24 123 4567.
export function toStoredNumber(raw) {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length === 12) digits = digits.slice(3)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length !== 9) return null
  return `+233${digits}`
}

export function formatStoredNumber(stored) {
  const digits = String(stored).replace(/\D/g, '')
  const local = digits.startsWith('233') ? digits.slice(3) : digits
  if (local.length !== 9) return stored
  return `0${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
}

export function parseNumberList(raw) {
  const tokens = String(raw)
    .split(/[\n,;]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const valid = []
  const invalid = []
  const seen = new Set()
  let duplicates = 0

  tokens.forEach((token) => {
    const stored = toStoredNumber(token)
    if (!stored) {
      invalid.push(token)
      return
    }
    if (seen.has(stored)) {
      duplicates += 1
      return
    }
    seen.add(stored)
    valid.push(stored)
  })

  return { valid, invalid, duplicates }
}

export function validateNumbers(raw) {
  const parsed = parseNumberList(raw)
  if (parsed.valid.length === 0 && parsed.invalid.length === 0) {
    return { numbers: 'Enter at least one number, separated by commas.' }
  }
  if (parsed.invalid.length > 0) {
    const shown = parsed.invalid.slice(0, 3).join(', ')
    const more = parsed.invalid.length > 3 ? ` and ${parsed.invalid.length - 3} more` : ''
    return { numbers: `Check these numbers: ${shown}${more}. Use 024 123 4567.` }
  }
  if (parsed.valid.length > maxNumbers) {
    return { numbers: `A number list can include up to ${maxNumbers} numbers.` }
  }
  return {}
}

export function validateGroups(groups) {
  if (!groups.length) return { groupIds: 'Choose at least one contact group.' }
  if (groups.some((group) => group.breakdown.active < 1)) {
    return { groupIds: 'Every group needs at least one active contact.' }
  }
  return {}
}

export function activeRecipients(groups) {
  return groups.reduce((sum, group) => sum + group.breakdown.active, 0)
}
