import { baseApi } from '../baseApi'

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientPlans: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/client/plans',
        params: { page, per_page: perPage },
      }),
      providesTags: (result) => {
        const plans = Array.isArray(result?.data) ? result.data : []
        return [...plans.map((plan) => ({ type: 'Plan', id: plan.id })), { type: 'Plan', id: 'LIST' }]
      },
    }),
  }),
})

export const { useGetClientPlansQuery } = plansApi
