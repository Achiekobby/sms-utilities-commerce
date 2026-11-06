import { formatWhen, labelize, monthSpan, money } from '../clients/clientModel'

export { formatWhen, labelize, monthSpan, money }

export const subscriptionStatuses = [
  { value: '', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
]

export function formatUnits(value) {
  if (value == null || value === '') return ''
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value)
  return number.toLocaleString('en-GH')
}

export function subscriptionParams({ page = 1, perPage = 15, clientId = '', status = '' } = {}) {
  const params = { page, per_page: perPage }
  if (clientId) params.client_id = clientId
  if (status) params.status = status
  return params
}

export function isMissingSubscription(error) {
  const status = error?.status ?? error?.data?.status_code
  return String(status) === '404'
}

export function topUpBody(planId, months) {
  return {
    plan_id: Number(planId),
    months: Number(months),
    type: 'non_expiry',
  }
}
