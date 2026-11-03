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
  profile: '/app/profile',
  campaigns: '/app/campaigns',
  newCampaign: '/app/campaigns/new',
  campaign: (campaignId) => `/app/campaigns/${campaignId}`,
  templates: '/app/templates',
  scheduled: '/app/scheduled',
  senderIds: '/app/sender-ids',
  newSenderId: '/app/sender-ids/new',
  messages: '/app/messages',
  newMessage: '/app/messages/new',
  message: (messageId) => `/app/messages/${messageId}`,
  wallet: '/app/wallet',
  walletTopUp: '/app/wallet/top-up',
  contactGroup: (groupId) => `/app/contacts/${groupId}`,
  contactUpload: (groupId) => `/app/contacts/${groupId}/upload`,
  contactUploads: (groupId) => `/app/contacts/${groupId}/uploads`,
}

export function safeCustomerReturn(from) {
  const pathname = typeof from?.pathname === 'string' ? from.pathname : ''
  const isCustomerPath = pathname === paths.app || pathname.startsWith(`${paths.app}/`)

  if (!isCustomerPath) return paths.app

  return `${pathname}${from.search ?? ''}${from.hash ?? ''}`
}
