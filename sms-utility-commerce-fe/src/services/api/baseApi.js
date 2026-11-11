import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './http'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: [
    'Profile',
    'ContactGroup',
    'Contact',
    'ContactImport',
    'ApiKey',
    'Wallet',
    'ActivityLog',
    'SenderId',
    'Sms',
    'Plan',
    'Subscription',
    'Payment',
    'Order',
  ],
  endpoints: () => ({}),
})
