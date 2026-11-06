export const settingsSections = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'permissions', label: 'Permissions' },
]

export function settingsSection(value) {
  return settingsSections.some((item) => item.id === value) ? value : 'profile'
}
