// The single source of truth for what an upload may contain. The template, the page copy and the
// validation worker all read from here, so what we ask for and what we check can never drift apart.

export const MAX_FILE_BYTES = 25 * 1024 * 1024
export const MAX_ROWS = 100_000
export const NAME_MAX = 50
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// Only the phone number is required. A contact can be messaged without a name or email.
export const columns = [
  {
    key: 'firstName',
    label: 'First Name',
    required: false,
    aliases: ['first name', 'firstname', 'first_name', 'given name'],
    help: `The contact's first name, up to ${NAME_MAX} characters.`,
    example: 'Ama',
    width: 18,
  },
  {
    key: 'lastName',
    label: 'Last Name',
    required: false,
    aliases: ['last name', 'lastname', 'last_name', 'surname', 'family name'],
    help: `The contact's last name, up to ${NAME_MAX} characters.`,
    example: 'Mensah',
    width: 18,
  },
  {
    key: 'phone',
    label: 'Phone Number',
    required: true,
    aliases: ['phone number', 'phone', 'phone_number', 'mobile', 'mobile number', 'msisdn', 'telephone', 'tel'],
    help: 'A Ghana mobile number. 024 123 4567, 0241234567 and +233 24 123 4567 all work.',
    example: '024 123 4567',
    width: 20,
  },
  {
    key: 'email',
    label: 'Email',
    required: false,
    aliases: ['email', 'email address', 'e-mail', 'e mail'],
    help: 'Optional. If you add one, it must look like name@example.com.',
    example: 'ama.mensah@example.com',
    width: 30,
  },
]

// Ghana mobile network prefixes (MTN, Telecel, AT and others), as they appear after the leading 0.
const mobilePrefixes = new Set(['20', '23', '24', '25', '26', '27', '28', '50', '53', '54', '55', '56', '57', '59'])

// Returns the number as +233XXXXXXXXX, or null when it is not a Ghana mobile number.
// Excel often drops a leading zero from numbers, so nine digits are accepted too.
export function normalizeGhanaPhone(input) {
  const cleaned = String(input).replace(/[\s\-().]/g, '')
  let national

  if (/^\+233\d{9}$/.test(cleaned)) national = cleaned.slice(4)
  else if (/^233\d{9}$/.test(cleaned)) national = cleaned.slice(3)
  else if (/^0\d{9}$/.test(cleaned)) national = cleaned.slice(1)
  else if (/^\d{9}$/.test(cleaned)) national = cleaned
  else return null

  return mobilePrefixes.has(national.slice(0, 2)) ? `+233${national}` : null
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Short labels for the filter chips on the problem list.
export const issueLabels = {
  'missing-first-name': 'Missing first name',
  'missing-phone': 'Missing phone number',
  'invalid-phone': 'Invalid phone number',
  'duplicate-phone': 'Duplicate number',
  'invalid-email': 'Invalid email',
  'name-too-long': 'Name too long',
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
