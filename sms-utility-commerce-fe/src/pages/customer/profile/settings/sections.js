export const settingsSections = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'preferences', label: 'Preferences' },
]

export function settingsSection(value) {
  return settingsSections.some((item) => item.id === value) ? value : 'profile'
}
