import { pageResult } from '../../../features/contacts/contactImport'
import { topUpFromApi, walletFromApi, walletTransactionFromApi } from '../../../features/wallet/walletRecord'
import { baseApi } from '../baseApi'

export const WALLET_PAGE_SIZE = 5

function listParams({ page = 1, perPage = WALLET_PAGE_SIZE, search = '', from = '', to = '', type = '', purpose = '' } = {}) {
  const params = { page, per_page: perPage }
  const term = String(search ?? '').trim()
  if (term) params.search = term
  if (from) params.from = from
  if (to) params.to = to
  if (type) params.type = type
  if (purpose) params.purpose = purpose
  return params
}

export const walletApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWallet: builder.query({
      query: () => ({
        url: '/api/client/wallet',
        method: 'GET',
      }),
      transformResponse: (envelope) => walletFromApi(envelope?.data),
      providesTags: ['Wallet'],
    }),
    getWalletTransactions: builder.query({
      query: (args = {}) => ({
        url: '/api/client/wallet/transactions',
        method: 'GET',
        params: listParams(args),
      }),
      transformResponse: (envelope) => pageResult(envelope, walletTransactionFromApi),
      providesTags: ['Wallet'],
    }),
    getWalletTopUps: builder.query({
      query: (args = {}) => ({
        url: '/api/client/wallet/top-ups',
        method: 'GET',
        params: listParams(args),
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
        message: envelope?.message || 'Complete the payment on the checkout page.',
        completed: String(envelope?.data?.status ?? '').toLowerCase() === 'completed',
      }),
      invalidatesTags: ['Wallet', { type: 'Payment', id: 'LIST' }, { type: 'Order', id: 'LIST' }],
    }),
  }),
})

export const useGetWalletQuery = walletApi.useGetWalletQuery
export const useGetWalletTransactionsQuery = walletApi.useGetWalletTransactionsQuery
export const useGetWalletTopUpsQuery = walletApi.useGetWalletTopUpsQuery
export const useCreateWalletTopUpMutation = walletApi.useCreateWalletTopUpMutation
