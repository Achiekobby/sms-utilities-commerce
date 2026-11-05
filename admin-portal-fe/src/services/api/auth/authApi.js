import { baseApi } from '../baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOtp: builder.mutation({
      query: (body) => ({
        url: '/api/admin/request_otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: '/api/admin/verify_otp',
        method: 'POST',
        body,
      }),
    }),
    resendOtp: builder.mutation({
      query: (body) => ({
        url: '/api/admin/resend_otp_request',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/api/admin/logout',
        method: 'POST',
        body: {},
        timeout: 8000,
      }),
    }),
  }),
})

export const { useRequestOtpMutation, useVerifyOtpMutation, useResendOtpMutation, useLogoutMutation } = authApi
