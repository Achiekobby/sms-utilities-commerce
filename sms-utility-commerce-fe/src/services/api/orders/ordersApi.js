import { pageResult } from '../../../features/contacts/contactImport'
import { orderFromApi } from '../../../features/orders/orderRecord'
import { baseApi } from '../baseApi'

function ordersParams({ page = 1, perPage = 15, status = '' } = {}) {
  const params = {
    page,
    per_page: perPage,
  }
  if (status) params.status = status
  return params
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientOrders: builder.query({
      query: (args = {}) => ({
        url: '/api/client/orders',
        method: 'GET',
        params: ordersParams(args),
      }),
      transformResponse: (envelope) => pageResult(envelope, orderFromApi),
      providesTags: (result) =>
        result?.rows?.length
          ? [
              ...result.rows.map((row) => ({ type: 'Order', id: row.id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getClientOrder: builder.query({
      query: (orderId) => ({
        url: `/api/client/orders/${orderId}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => orderFromApi(envelope?.data),
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: String(orderId) }],
    }),
  }),
})

export const { useGetClientOrdersQuery, useGetClientOrderQuery } = ordersApi
