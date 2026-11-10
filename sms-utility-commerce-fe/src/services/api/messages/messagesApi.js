import { pageResult } from '../../../features/contacts/contactImport'
import { smsFromApi } from '../../../pages/customer/messages/model'
import { baseApi } from '../baseApi'

function messageOf(envelope, fallback) {
  return typeof envelope?.message === 'string' && envelope.message ? envelope.message : fallback
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/client/sms',
        method: 'GET',
        params: { page, per_page: perPage },
      }),
      transformResponse: (envelope) => pageResult(envelope, smsFromApi),
      providesTags: (result) => [
        { type: 'Sms', id: 'LIST' },
        ...(result?.rows ?? []).map((row) => ({ type: 'Sms', id: row.id })),
      ],
    }),
    sendQuickSms: builder.mutation({
      query: (body) => ({
        url: '/api/client/sms/quick',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        data: envelope?.data ?? null,
        message: messageOf(envelope, 'Message sent.'),
      }),
      invalidatesTags: [{ type: 'Sms', id: 'LIST' }, 'Wallet'],
    }),
    sendBulkSms: builder.mutation({
      query: (body) => ({
        url: '/api/client/sms/bulk',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        data: envelope?.data ?? null,
        message: messageOf(envelope, 'Message queued for sending.'),
      }),
      invalidatesTags: [{ type: 'Sms', id: 'LIST' }, 'Wallet'],
    }),
  }),
})

export const { useGetMessagesQuery, useSendQuickSmsMutation, useSendBulkSmsMutation } = messagesApi
