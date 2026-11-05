import { activityLogFromApi } from '../../../features/activity/activityLog'
import { pageResult } from '../../../features/contacts/contactImport'
import { baseApi } from '../baseApi'

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/client/activity-logs',
        method: 'GET',
        params: { page, per_page: perPage },
      }),
      transformResponse: (envelope) => pageResult(envelope, activityLogFromApi),
      providesTags: ['ActivityLog'],
    }),
  }),
})

export const { useGetActivityLogsQuery } = activityApi
