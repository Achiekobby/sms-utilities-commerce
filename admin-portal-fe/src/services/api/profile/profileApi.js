import { baseApi } from '../baseApi'

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({ url: '/api/admin/profile' }),
      providesTags: ['Admin'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/api/admin/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
})

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi
