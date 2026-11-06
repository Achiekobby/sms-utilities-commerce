import { baseApi } from '../baseApi'

export const senderIdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSenderIds: builder.query({
      query: ({ page = 1, perPage = 15, status = '' } = {}) => {
        const params = { page, per_page: perPage }
        if (status) params.status = status
        return { url: '/api/admin/sender-ids', params }
      },
      providesTags: (result) => {
        const records = Array.isArray(result?.data) ? result.data : []
        return [...records.map((record) => ({ type: 'SenderId', id: record.id })), { type: 'SenderId', id: 'LIST' }]
      },
    }),
    getSenderId: builder.query({
      query: (id) => ({ url: `/api/admin/sender-ids/${id}` }),
      providesTags: (result, error, id) => [{ type: 'SenderId', id }],
    }),
    approveSenderId: builder.mutation({
      query: (id) => ({
        url: `/api/admin/sender-ids/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'SenderId', id },
        { type: 'SenderId', id: 'LIST' },
      ],
    }),
    rejectSenderId: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `/api/admin/sender-ids/${id}/reject`,
        method: 'POST',
        body: { rejection_reason: rejectionReason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SenderId', id },
        { type: 'SenderId', id: 'LIST' },
      ],
    }),
  }),
})

export const { useGetSenderIdsQuery, useGetSenderIdQuery, useApproveSenderIdMutation, useRejectSenderIdMutation } =
  senderIdsApi
