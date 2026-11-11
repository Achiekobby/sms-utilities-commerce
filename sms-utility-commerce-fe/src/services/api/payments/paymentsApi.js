import { pageResult } from '../../../features/contacts/contactImport'
import { paymentFromApi } from '../../../features/payments/paymentRecord'
import { baseApi } from '../baseApi'

function paymentsParams({ page = 1, perPage = 15, status = '', purpose = '', from = '', to = '' } = {}) {
  const params = {
    page,
    per_page: perPage,
  }

  if (status) params.status = status
  if (purpose) params.purpose = purpose
  if (from) params.from = from
  if (to) params.to = to

  return params
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientPayments: builder.query({
      query: (args = {}) => ({
        url: '/api/client/payments',
        method: 'GET',
        params: paymentsParams(args),
      }),
      transformResponse: (envelope) => pageResult(envelope, paymentFromApi),
      providesTags: (result) =>
        result?.rows?.length
          ? [
              ...result.rows.map((row) => ({ type: 'Payment', id: row.id })),
              { type: 'Payment', id: 'LIST' },
            ]
          : [{ type: 'Payment', id: 'LIST' }],
    }),
    getClientPayment: builder.query({
      query: (paymentId) => ({
        url: `/api/client/payments/${paymentId}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => paymentFromApi(envelope?.data),
      providesTags: (_result, _error, paymentId) => [{ type: 'Payment', id: String(paymentId) }],
    }),
  }),
})

export const { useGetClientPaymentsQuery, useGetClientPaymentQuery } = paymentsApi
