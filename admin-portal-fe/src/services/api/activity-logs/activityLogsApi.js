import { activityParams } from '../../../features/activity-logs/activityModel'
import { baseApi } from '../baseApi'

export const activityLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityFilters: builder.query({
      query: () => ({ url: '/api/admin/activity-logs/filters' }),
      providesTags: [{ type: 'ActivityLog', id: 'FILTERS' }],
    }),
    getActivityLogs: builder.query({
      query: ({ page = 1, perPage = 15, filters = {} } = {}) => ({
        url: '/api/admin/activity-logs',
        params: activityParams(filters, { page, perPage, includeClientId: true }),
      }),
      providesTags: [{ type: 'ActivityLog', id: 'LIST' }],
    }),
    getClientActivityLogs: builder.query({
      query: ({ clientId, page = 1, perPage = 15, filters = {} }) => ({
        url: `/api/admin/clients/${clientId}/activity-logs`,
        params: activityParams(filters, { page, perPage, includeClientId: false }),
      }),
      providesTags: (result, error, { clientId }) => [{ type: 'ActivityLog', id: `CLIENT-${clientId}` }],
    }),
  }),
})

export const { useGetActivityFiltersQuery, useGetActivityLogsQuery, useGetClientActivityLogsQuery } = activityLogsApi
