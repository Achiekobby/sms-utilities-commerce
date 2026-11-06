import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './http'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Admin', 'Client', 'SenderId', 'Plan', 'ActivityLog', 'Subscription', 'SubscriptionArchive', 'PaymentGateway', 'Role', 'Permission'],
  endpoints: () => ({}),
})
