import { pageResult } from '../../../features/contacts/contactImport'
import { senderIdFromApi } from '../../../pages/customer/sender-ids/model'
import { baseApi } from '../baseApi'

function messageOf(envelope, fallback) {
  return typeof envelope?.message === 'string' && envelope.message ? envelope.message : fallback
}

export const senderIdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSenderIds: builder.query({
      query: ({ page = 1, perPage = 15, search = '', status = 'all' } = {}) => {
        const params = { page, per_page: perPage }
        const term = String(search ?? '').trim()
        if (term) params.search = term
        if (status && status !== 'all') params.status = status
        return {
          url: '/api/client/sender-ids',
          method: 'GET',
          params,
        }
      },
      transformResponse: (envelope) => pageResult(envelope, senderIdFromApi),
      providesTags: (result) => [
        { type: 'SenderId', id: 'LIST' },
        ...(result?.rows ?? []).map((row) => ({ type: 'SenderId', id: row.id })),
      ],
    }),
    getSenderId: builder.query({
      query: (id) => ({
        url: `/api/client/sender-ids/${id}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => senderIdFromApi(envelope?.data),
      providesTags: (_result, _error, id) => [{ type: 'SenderId', id }],
    }),
    createSenderId: builder.mutation({
      query: (body) => ({
        url: '/api/client/sender-ids',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        sender: senderIdFromApi(envelope?.data),
        message: messageOf(envelope, 'Sender ID submitted for approval.'),
      }),
      invalidatesTags: [{ type: 'SenderId', id: 'LIST' }],
    }),
    updateSenderId: builder.mutation({
      query: ({ id, name }) => ({
        url: `/api/client/sender-ids/${id}`,
        method: 'PUT',
        body: { name },
      }),
      transformResponse: (envelope) => ({
        sender: senderIdFromApi(envelope?.data),
        message: messageOf(envelope, 'Sender ID updated and sent for approval.'),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SenderId', id: 'LIST' },
        { type: 'SenderId', id },
      ],
    }),
    deleteSenderId: builder.mutation({
      query: (id) => ({
        url: `/api/client/sender-ids/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => ({
        message: messageOf(envelope, 'Sender ID deleted.'),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SenderId', id: 'LIST' },
        { type: 'SenderId', id },
      ],
    }),
  }),
})

export const {
  useGetSenderIdsQuery,
  useGetSenderIdQuery,
  useCreateSenderIdMutation,
  useUpdateSenderIdMutation,
  useDeleteSenderIdMutation,
} = senderIdsApi
