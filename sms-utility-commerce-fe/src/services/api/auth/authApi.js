import { clientFromApi } from '../../../features/auth/client'
import { baseApi } from '../baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: '/api/client/signup',
        method: 'POST',
        body,
      }),
    }),
    requestOtp: builder.mutation({
      query: (body) => ({
        url: '/api/client/request_otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: '/api/client/verify_otp',
        method: 'POST',
        body,
      }),
    }),
    resendOtp: builder.mutation({
      query: (body) => ({
        url: '/api/client/resend_otp_request',
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/api/client/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    getProfile: builder.query({
      query: () => ({
        url: '/api/client/profile',
        method: 'GET',
      }),
      transformResponse: (envelope) => (envelope?.data ? clientFromApi(envelope.data) : null),
      providesTags: ['Profile'],
    }),
    logout: builder.mutation({
      query: (token) => ({
        url: '/api/client/logout',
        method: 'POST',
        body: {},
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      }),
    }),
  }),
})

export const {
  useSignupMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi
