export const countryCode = '+233'
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Accepts 024 123 4567 or 24 123 4567 and returns +233241234567, or null when it is not a full number.
export function toPhoneIdentifier(raw) {
  const digits = raw.replace(/\D/g, '').replace(/^0/, '')
  return digits.length === 9 ? `${countryCode}${digits}` : null
}
