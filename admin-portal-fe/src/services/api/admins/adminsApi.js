import { baseApi } from '../baseApi'

function adminTags(id) {
  return [
    { type: 'Admin', id },
    { type: 'Admin', id: String(id) },
    { type: 'Admin', id: 'LIST' },
  ]
}

export const adminsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/admin/admins',
        params: { page, per_page: perPage },
      }),
      providesTags: (result) => {
        const admins = Array.isArray(result?.data) ? result.data : []
        return [...admins.map((admin) => ({ type: 'Admin', id: admin.id })), { type: 'Admin', id: 'LIST' }]
      },
    }),
    getAdmin: builder.query({
      query: (id) => ({ url: `/api/admin/admins/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),
    updateAdmin: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/admins/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => adminTags(id),
    }),
    updateAdminStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/admins/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => adminTags(id),
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/admin/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => adminTags(id),
    }),
    assignAdminRole: builder.mutation({
      query: ({ id, roleId }) => ({
        url: `/api/admin/admins/${id}/role`,
        method: 'PUT',
        body: { role_id: Number(roleId) },
      }),
      invalidatesTags: (result, error, { id }) => adminTags(id),
    }),
  }),
})

export const {
  useGetAdminsQuery,
  useGetAdminQuery,
  useUpdateAdminMutation,
  useUpdateAdminStatusMutation,
  useDeleteAdminMutation,
  useAssignAdminRoleMutation,
} = adminsApi
