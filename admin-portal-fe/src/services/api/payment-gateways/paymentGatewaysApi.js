import { baseApi } from '../baseApi'

export const paymentGatewaysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentGateways: builder.query({
      query: () => ({ url: '/api/admin/payment-gateways' }),
      providesTags: [{ type: 'PaymentGateway', id: 'LIST' }],
    }),
    updatePaymentGateway: builder.mutation({
      query: ({ code, body }) => ({
        url: `/api/admin/payment-gateways/${code}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'PaymentGateway', id: 'LIST' }],
    }),
    setPrimaryPaymentGateway: builder.mutation({
      query: (code) => ({
        url: `/api/admin/payment-gateways/${code}/primary`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'PaymentGateway', id: 'LIST' }],
    }),
  }),
})

export const { useGetPaymentGatewaysQuery, useUpdatePaymentGatewayMutation, useSetPrimaryPaymentGatewayMutation } =
  paymentGatewaysApi
