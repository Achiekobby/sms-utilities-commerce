import { pageResult } from '../../../features/contacts/contactImport'
import { topUpFromApi, walletFromApi } from '../../../features/wallet/walletRecord'
import { baseApi } from '../baseApi'

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query({
      query: () => ({
        url: '/api/client/wallet',
        method: 'GET',
      }),
      transformResponse: (envelope) => walletFromApi(envelope?.data),
      providesTags: ['Wallet'],
    }),
    getWalletTopUps: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/client/wallet/top-ups',
        method: 'GET',
        params: { page, per_page: perPage },
      }),
      transformResponse: (envelope) => pageResult(envelope, topUpFromApi),
      providesTags: ['Wallet'],
    }),
    createWalletTopUp: builder.mutation({
      query: (body) => ({
        url: '/api/client/wallet/top-ups',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        topUp: topUpFromApi(envelope?.data),
        message: envelope?.message || 'Top-up started.',
        completed: String(envelope?.data?.status ?? '').toLowerCase() === 'completed',
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
})

export const { useGetWalletQuery, useGetWalletTopUpsQuery, useCreateWalletTopUpMutation } = walletApi
