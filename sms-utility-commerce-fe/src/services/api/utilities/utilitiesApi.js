import { mapUtilityCatalog, mapUtilityLookup, mapUtilityPurchase, mapUtilityQuote } from '../../../features/utilities/utilityModel'
import { baseApi } from '../baseApi'

export const utilitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUtilityCatalog: builder.query({
      query: () => ({ url: '/api/client/utilities/catalog' }),
      transformResponse: (response) => mapUtilityCatalog(response?.data),
      providesTags: [{ type: 'Utility', id: 'CATALOG' }],
    }),
    quoteUtility: builder.mutation({
      query: (body) => ({
        url: '/api/client/utilities/quote',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        ...mapUtilityQuote(envelope?.data),
        message: envelope?.message || 'Quote ready.',
        pointInTime: envelope?.point_in_time || null,
      }),
    }),
    purchaseUtility: builder.mutation({
      query: (body) => ({
        url: '/api/client/utilities/purchase',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        ...mapUtilityPurchase(envelope?.data),
        message: envelope?.message || 'Complete the payment on the checkout page.',
      }),
      invalidatesTags: ['Wallet', { type: 'Payment', id: 'LIST' }, { type: 'Order', id: 'LIST' }],
    }),
    lookupUtilityAccount: builder.mutation({
      query: (body) => ({
        url: '/api/client/utilities/lookup',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        ...mapUtilityLookup(envelope?.data),
        message: envelope?.message || 'Account verified.',
        pointInTime: envelope?.point_in_time || null,
      }),
    }),
  }),
})

export const {
  useGetUtilityCatalogQuery,
  useQuoteUtilityMutation,
  useLookupUtilityAccountMutation,
  usePurchaseUtilityMutation,
} = utilitiesApi
