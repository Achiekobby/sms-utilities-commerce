import { pageResult } from '../../../features/contacts/contactImport'
import { baseApi } from '../baseApi'

function text(value) {
  return value == null ? '' : String(value).trim()
}

function isNonExpiryType(type, months) {
  const key = String(type ?? '').toLowerCase()
  return key === 'non_expiry' || key === 'non-expiry' || Number(months) === 0
}

function subscriptionFromApi(data) {
  if (!data || typeof data !== 'object') return null

  const monthsRaw = data.duration_in_months ?? data.months
  const months = monthsRaw == null || monthsRaw === '' ? null : Number(monthsRaw)
  const type = text(data.type || data.plan_type).toLowerCase()
  const nonExpiry = isNonExpiryType(type, months) || Boolean(data.non_expiry)

  return {
    id: data.id == null ? null : String(data.id),
    clientId: data.client_id == null ? null : String(data.client_id),
    planId: data.plan_id == null ? null : String(data.plan_id),
    planName: text(data.plan_name ?? data.plan?.name),
    status: text(data.status).toLowerCase(),
    months: Number.isFinite(months) ? months : null,
    units: data.units == null || data.units === '' ? null : Number(data.units),
    price: data.price == null || data.price === '' ? null : Number(data.price),
    nonExpiry,
    startsAt: data.starts_at ?? data.started_at ?? null,
    endsAt: data.ends_at ?? data.expires_at ?? null,
    type,
    raw: data,
  }
}

function subscriptionArchiveFromApi(data) {
  if (!data || typeof data !== 'object') return null
  const id = data.id
  if (id == null) return null

  const monthsRaw = data.duration_in_months ?? data.months
  const months = monthsRaw == null || monthsRaw === '' ? null : Number(monthsRaw)
  const type = text(data.plan_type || data.type).toLowerCase()
  const nonExpiry = isNonExpiryType(type, months) || Boolean(data.non_expiry)

  return {
    id: String(id),
    planId: data.plan_id == null ? null : String(data.plan_id),
    planName: text(data.plan_name),
    price: data.plan_price == null || data.plan_price === '' ? null : Number(data.plan_price),
    units: data.units == null || data.units === '' ? null : Number(data.units),
    type,
    months: Number.isFinite(months) ? months : null,
    nonExpiry,
    startsAt: data.starts_at ?? null,
    endsAt: data.ends_at ?? null,
    paymentStatus: text(data.payment_status).toLowerCase(),
    paymentId: data.payment_id == null ? null : String(data.payment_id),
    paymentReference: text(data.payment_reference),
    raw: data,
  }
}

function subscriptionCheckoutFromApi(data) {
  if (!data || typeof data !== 'object') return null

  const nextActionUrl = data.next_action?.url ?? data.next_action?.redirect_url
  const nextUrl = text(
    data.payment_link ?? data.authorization_url ?? data.checkout_url ?? data.payment_url ?? nextActionUrl,
  )

  return {
    id: data.id == null ? null : String(data.id),
    resource: text(data.resource),
    orderId: data.order_id == null ? null : String(data.order_id),
    referenceId: text(data.reference_id),
    purpose: text(data.purpose),
    method: text(data.method),
    network: text(data.network),
    msisdn: text(data.msisdn),
    amount: data.amount == null ? '' : String(data.amount),
    charge: data.charge == null ? '' : String(data.charge),
    totalAmount: data.total_amount == null ? '' : String(data.total_amount),
    currency: text(data.currency) || 'GHS',
    status: text(data.status).toLowerCase(),
    paymentLink: text(data.payment_link),
    nextUrl,
    nextActionType: text(data.next_action?.type).toLowerCase(),
    createdAt: text(data.created_at),
    raw: data,
  }
}

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientSubscription: builder.query({
      query: () => ({
        url: '/api/client/subscription',
        method: 'GET',
      }),
      transformResponse: (envelope) => subscriptionFromApi(envelope?.data),
      providesTags: [{ type: 'Subscription', id: 'CURRENT' }],
    }),
    getClientSubscriptionArchives: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/client/subscription/archives',
        method: 'GET',
        params: { page, per_page: perPage },
      }),
      transformResponse: (envelope) => pageResult(envelope, subscriptionArchiveFromApi),
      providesTags: [{ type: 'Subscription', id: 'ARCHIVES' }],
    }),
    subscribeToPlan: builder.mutation({
      query: (body) => ({
        url: '/api/client/subscription',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        checkout: subscriptionCheckoutFromApi(envelope?.data),
        message: envelope?.message || 'Complete the payment on the checkout page.',
      }),
      invalidatesTags: [
        { type: 'Subscription', id: 'CURRENT' },
        { type: 'Subscription', id: 'ARCHIVES' },
        { type: 'Payment', id: 'LIST' },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetClientSubscriptionQuery,
  useGetClientSubscriptionArchivesQuery,
  useSubscribeToPlanMutation,
} = subscriptionsApi

/** Body for POST /api/client/subscription — pay via gateway, not wallet. */
export function subscribeBody({ planId, months, nonExpiry = false }) {
  const period = nonExpiry || Number(months) === 0 ? 0 : Number(months)
  return {
    plan_id: Number(planId),
    months: Number.isFinite(period) ? period : Number(months),
  }
}
