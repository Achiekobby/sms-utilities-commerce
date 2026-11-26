export const paths = {
  home: '/',
  pricing: '/pricing',
  help: '/help',
  docs: '/docs',
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
  editCampaign: (campaignId) => `/app/campaigns/${campaignId}/edit`,
  templates: '/app/templates',
  newTemplate: '/app/templates/new',
  editTemplate: (templateId) => `/app/templates/${templateId}/edit`,
  template: (templateId) => `/app/templates/${templateId}`,
  scheduled: '/app/scheduled',
  senderIds: '/app/sender-ids',
  newSenderId: '/app/sender-ids/new',
  messages: '/app/messages',
  newMessage: '/app/messages/new',
  message: (messageId) => `/app/messages/${messageId}`,
  wallet: '/app/wallet',
  walletTopUp: '/app/wallet/top-up',
  plans: '/app/plans',
  planCheckout: '/app/plans/checkout',
  planCheckoutFor: (planId, months) =>
    `/app/plans/checkout?plan=${encodeURIComponent(String(planId))}&months=${encodeURIComponent(String(months))}`,
  payments: '/app/payments',
  paymentSuccess: '/app/payments/success',
  payment: (paymentId) => `/app/payments/${paymentId}`,
  orders: '/app/orders',
  order: (orderId) => `/app/orders/${orderId}`,
  utilities: '/app/utilities',
  utility: (service) => `/app/utilities/${encodeURIComponent(String(service))}`,
  rewards: '/app/rewards',
  publicSurvey: (surveyId) => `/s/${encodeURIComponent(String(surveyId))}`,
  surveys: '/app/surveys',
  newSurvey: '/app/surveys/new',
  survey: (surveyId) => `/app/surveys/${surveyId}`,
  editSurvey: (surveyId) => `/app/surveys/${surveyId}/edit`,
  apiKeys: '/app/api-keys',
  activityLogs: '/app/activity-logs',
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
