import { baseApi } from '../baseApi'

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/admin/clients',
        params: { page, per_page: perPage },
      }),
      providesTags: (result) => {
        const clients = Array.isArray(result?.data) ? result.data : []
        return [
          ...clients.map((client) => ({ type: 'Client', id: client.id })),
          { type: 'Client', id: 'LIST' },
        ]
      },
    }),
    getClient: builder.query({
      query: (id) => ({ url: `/api/admin/clients/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),
    updateClient: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/clients/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Client', id }, { type: 'Client', id: 'LIST' }],
    }),
    updateClientStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/clients/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Client', id }, { type: 'Client', id: 'LIST' }],
    }),
  }),
})

export const { useGetClientsQuery, useGetClientQuery, useUpdateClientMutation, useUpdateClientStatusMutation } = clientsApi
