export const paths = {
  home: '/',
  pricing: '/pricing',
  help: '/help',
  terms: '/terms',
  login: '/login',
  signup: '/signup',
  verify: '/verify',
  app: '/app',
  dashboard: '/app/dashboard',
  contacts: '/app/contacts',
  contactGroup: (groupId) => `/app/contacts/${groupId}`,
  contactUpload: (groupId) => `/app/contacts/${groupId}/upload`,
}

export function safeCustomerReturn(from) {
  const pathname = typeof from?.pathname === 'string' ? from.pathname : ''
  const isCustomerPath = pathname === paths.app || pathname.startsWith(`${paths.app}/`)

  if (!isCustomerPath) return paths.app

  return `${pathname}${from.search ?? ''}${from.hash ?? ''}`
}
