import { pageResult } from '../../../features/contacts/contactImport'
import {
  smsDeliveryReportFromApi,
  smsFromApi,
  smsRecipientFromApi,
  smsStatusFromApi,
} from '../../../pages/customer/messages/model'
import { baseApi } from '../baseApi'

function messageOf(envelope, fallback) {
  return typeof envelope?.message === 'string' && envelope.message ? envelope.message : fallback
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: ({
        page = 1,
        perPage = 15,
        contactGroupId = '',
        type = '',
        status = '',
        requestType = '',
        mode = '',
        fromDate = '',
        toDate = '',
      } = {}) => {
        const params = { page, per_page: perPage }
        if (contactGroupId) params.contact_group_id = contactGroupId
        if (type) params.type = type
        if (status) params.status = status
        if (requestType) params.request_type = requestType
        if (mode) params.mode = mode
        if (fromDate) params.from_date = fromDate
        if (toDate) params.to_date = toDate
        return {
          url: '/api/client/sms',
          method: 'GET',
          params,
        }
      },
      transformResponse: (envelope) => pageResult(envelope, smsFromApi),
      providesTags: (result) => [
        { type: 'Sms', id: 'LIST' },
        ...(result?.rows ?? []).map((row) => ({ type: 'Sms', id: row.id })),
      ],
    }),
    getSms: builder.query({
      query: (id) => ({
        url: `/api/client/sms/${id}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => smsFromApi(envelope?.data),
      providesTags: (result, _error, id) => [{ type: 'Sms', id: result?.id ?? String(id) }],
    }),
    getSmsRecipients: builder.query({
      query: ({
        smsId,
        page = 1,
        perPage = 50,
        status = '',
        type = '',
        requestType = '',
        contactGroupId = '',
      } = {}) => {
        const params = { page, per_page: perPage }
        if (status) params.status = status
        if (type) params.type = type
        if (requestType) params.request_type = requestType
        if (contactGroupId) params.contact_group_id = contactGroupId
        return {
          url: `/api/client/sms/${smsId}/recipients`,
          method: 'GET',
          params,
        }
      },
      transformResponse: (envelope) => pageResult(envelope, smsRecipientFromApi),
      providesTags: (_result, _error, arg) => [{ type: 'Sms', id: `RECIPIENTS-${arg.smsId}` }],
    }),
    getSmsStatus: builder.query({
      query: (messageId) => ({
        url: `/api/client/sms/status/${messageId}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => smsStatusFromApi(envelope?.data),
      providesTags: (result) =>
        result?.id
          ? [
              { type: 'Sms', id: result.id },
              { type: 'Sms', id: `STATUS-${result.messageId || result.id}` },
            ]
          : ['Sms'],
    }),
    getSmsDeliveryReport: builder.query({
      query: ({ smsId, page = 1, perPage = 50 } = {}) => ({
        url: `/api/client/sms/${smsId}/delivery-report`,
        method: 'GET',
        params: { page, per_page: perPage },
      }),
      transformResponse: (envelope) => smsDeliveryReportFromApi(envelope?.data),
      providesTags: (_result, _error, arg) => [{ type: 'Sms', id: `DELIVERY-${arg.smsId}` }],
    }),
    cancelSms: builder.mutation({
      query: (smsId) => ({
        url: `/api/client/sms/${smsId}/cancel`,
        method: 'POST',
      }),
      transformResponse: (envelope) => ({
        data: smsFromApi(envelope?.data) ?? envelope?.data ?? null,
        message: messageOf(envelope, 'Scheduled message cancelled.'),
      }),
      invalidatesTags: (result, _error, smsId) => [
        { type: 'Sms', id: 'LIST' },
        { type: 'Sms', id: String(smsId) },
        { type: 'Sms', id: `RECIPIENTS-${smsId}` },
        { type: 'Sms', id: `DELIVERY-${smsId}` },
        ...(result?.data?.messageId ? [{ type: 'Sms', id: `STATUS-${result.data.messageId}` }] : []),
        'Wallet',
        { type: 'Subscription', id: 'CURRENT' },
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
      invalidatesTags: [{ type: 'Sms', id: 'LIST' }, 'Wallet', { type: 'Subscription', id: 'CURRENT' }],
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
      invalidatesTags: [{ type: 'Sms', id: 'LIST' }, 'Wallet', { type: 'Subscription', id: 'CURRENT' }],
    }),
    reblastSms: builder.mutation({
      query: ({ smsId, body }) => ({
        url: `/api/client/sms/${smsId}/reblast`,
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        data: envelope?.data ?? null,
        message: messageOf(envelope, 'Message queued for sending.'),
      }),
      invalidatesTags: (_result, _error, { smsId }) => [
        { type: 'Sms', id: 'LIST' },
        { type: 'Sms', id: String(smsId) },
        { type: 'Sms', id: `RECIPIENTS-${smsId}` },
        'Wallet',
        { type: 'Subscription', id: 'CURRENT' },
      ],
    }),
    resendSms: builder.mutation({
      query: ({ smsId, body }) => ({
        url: `/api/client/sms/${smsId}/resend`,
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        data: envelope?.data ?? null,
        message: messageOf(envelope, 'Message queued for sending.'),
      }),
      invalidatesTags: (_result, _error, { smsId }) => [
        { type: 'Sms', id: 'LIST' },
        { type: 'Sms', id: String(smsId) },
        { type: 'Sms', id: `RECIPIENTS-${smsId}` },
        'Wallet',
        { type: 'Subscription', id: 'CURRENT' },
      ],
    }),
  }),
})

export const {
  useGetMessagesQuery,
  useGetSmsQuery,
  useGetSmsRecipientsQuery,
  useGetSmsStatusQuery,
  useGetSmsDeliveryReportQuery,
  useCancelSmsMutation,
  useSendQuickSmsMutation,
  useSendBulkSmsMutation,
  useReblastSmsMutation,
  useResendSmsMutation,
} = messagesApi
