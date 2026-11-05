const notificationKey = 'utilisms.notification-preferences'
const displayKey = 'utilisms.display-preferences'

export const notificationDefaults = {
  email: true,
  push: true,
  product: true,
  security: true,
  activity: true,
  marketing: false,
}

export const displayDefaults = {
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Accra',
  theme: 'light',
}

export const languages = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'French' },
  { id: 'tw', label: 'Twi' },
]

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function readNotifications() {
  return read(notificationKey, notificationDefaults)
}

export function saveNotifications(value) {
  write(notificationKey, value)
}

export function readDisplay() {
  return read(displayKey, displayDefaults)
}

export function saveDisplay(value) {
  write(displayKey, value)
}

export function timezoneOptions() {
  const current = displayDefaults.timezone
  const supported = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
  const preferred = ['Africa/Accra', 'Africa/Lagos', 'Europe/London', 'America/New_York', current]
  const list = [...new Set([...preferred, ...supported])]
  return list
}
