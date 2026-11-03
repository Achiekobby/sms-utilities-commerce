import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './http'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Profile', 'ContactGroup', 'Contact', 'ContactImport'],
  endpoints: () => ({}),
})
