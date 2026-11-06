import { baseApi } from '../baseApi'

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    onboardClient: builder.mutation({
      query: (body) => ({
        url: '/api/admin/onboard/client',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    onboardAdmin: builder.mutation({
      query: (body) => ({
        url: '/api/admin/onboard/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Admin', id: 'LIST' }],
    }),
  }),
})

export const { useOnboardClientMutation, useOnboardAdminMutation } = onboardingApi
