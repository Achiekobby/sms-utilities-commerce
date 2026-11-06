import { baseApi } from '../baseApi'

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: () => ({ url: '/api/admin/permissions' }),
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
    getRoles: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/admin/roles',
        params: { page, per_page: perPage },
      }),
      providesTags: (result) => {
        const roles = Array.isArray(result?.data) ? result.data : []
        return [...roles.map((role) => ({ type: 'Role', id: role.id })), { type: 'Role', id: 'LIST' }]
      },
    }),
    getRole: builder.query({
      query: (id) => ({ url: `/api/admin/roles/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),
    createRole: builder.mutation({
      query: (body) => ({
        url: '/api/admin/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),
  }),
})

export const { useGetPermissionsQuery, useGetRolesQuery, useGetRoleQuery, useCreateRoleMutation, useUpdateRoleMutation } = rolesApi
