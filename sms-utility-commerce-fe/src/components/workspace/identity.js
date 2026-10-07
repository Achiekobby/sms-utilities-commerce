function initialsOf(text) {
  const words = text
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)

  if (words.length === 0) return 'U'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

// What the shell shows for the signed-in account: the workspace (business or personal)
// and the person using it.
export function getIdentity(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const person = fullName || user?.identifier || user?.name || 'Account'
  const isBusiness = user?.accountType === 'business'

  if (isBusiness) {
    const name = user?.businessName || 'Business workspace'
    return { name, kind: 'Business account', initials: initialsOf(name), person }
  }

  const kind = user?.accountType === 'individual' ? 'Individual account' : 'Personal account'
  const name = user?.firstName ? `${user.firstName}’s workspace` : 'Personal workspace'

  return { name, kind, initials: initialsOf(fullName || person), person }
}
