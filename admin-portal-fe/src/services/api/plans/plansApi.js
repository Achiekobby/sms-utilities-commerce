import { baseApi } from '../baseApi'

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query({
      query: ({ page = 1, perPage = 15 } = {}) => ({
        url: '/api/admin/plans',
        params: { page, per_page: perPage },
      }),
      providesTags: (result) => {
        const plans = Array.isArray(result?.data) ? result.data : []
        return [...plans.map((plan) => ({ type: 'Plan', id: plan.id })), { type: 'Plan', id: 'LIST' }]
      },
    }),
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
    getPlan: builder.query({
      query: (id) => ({ url: `/api/admin/plans/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Plan', id }],
    }),
    createPlan: builder.mutation({
      query: (body) => ({
        url: '/api/admin/plans',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Plan', id: 'LIST' }],
    }),
    updatePlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/plans/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Plan', id }, { type: 'Plan', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPlansQuery,
  useGetClientPlansQuery,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
} = plansApi
