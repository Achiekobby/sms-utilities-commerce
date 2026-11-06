import { subscriptionParams } from '../../../features/subscriptions/subscriptionModel'
import { baseApi } from '../baseApi'

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: ({ page = 1, perPage = 15, clientId = '', status = '' } = {}) => ({
        url: '/api/admin/subscriptions',
        params: subscriptionParams({ page, perPage, clientId, status }),
      }),
      providesTags: (result) => {
        const records = Array.isArray(result?.data) ? result.data : []
        return [...records.map((record) => ({ type: 'Subscription', id: record.id })), { type: 'Subscription', id: 'LIST' }]
      },
    }),
    getClientSubscription: builder.query({
      query: (clientId) => ({ url: `/api/admin/clients/${clientId}/subscription` }),
      providesTags: (result, error, clientId) => [{ type: 'Subscription', id: `CLIENT-${clientId}` }],
    }),
    getSubscriptionArchives: builder.query({
      query: ({ clientId, page = 1, perPage = 15 }) => ({
        url: '/api/admin/subscription-archives',
        params: subscriptionParams({ page, perPage, clientId }),
      }),
      providesTags: (result, error, { clientId }) => [{ type: 'SubscriptionArchive', id: `CLIENT-${clientId}` }],
    }),
    activateSubscription: builder.mutation({
      query: ({ clientId, body }) => ({
        url: `/api/admin/clients/${clientId}/subscription`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: 'Subscription', id: 'LIST' },
        { type: 'Subscription', id: `CLIENT-${clientId}` },
        { type: 'SubscriptionArchive', id: `CLIENT-${clientId}` },
        { type: 'Client', id: clientId },
        { type: 'Client', id: String(clientId) },
        { type: 'Client', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetSubscriptionsQuery,
  useGetClientSubscriptionQuery,
  useGetSubscriptionArchivesQuery,
  useActivateSubscriptionMutation,
} = subscriptionsApi
