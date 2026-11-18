import { pageResult } from '../../../features/contacts/contactImport'
import { rewardFromApi, rewardsCatalogFromApi } from '../../../features/rewards/rewardRecord'
import { baseApi } from '../baseApi'

function listParams({ page = 1, perPage = 12, search = '', type = '', status = '' } = {}) {
  const params = { page, per_page: perPage }
  const term = String(search ?? '').trim()
  if (term) params.search = term
  if (type) params.type = type
  if (status) params.status = status
  return params
}

export const rewardsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getRewards: builder.query({
      query: (args = {}) => ({
        url: '/api/client/rewards',
        method: 'GET',
        params: listParams(args),
      }),
      transformResponse: (envelope) => pageResult(envelope, rewardFromApi),
      providesTags: (result) =>
        result?.rows?.length
          ? [...result.rows.map((row) => ({ type: 'Reward', id: row.id })), { type: 'Reward', id: 'LIST' }]
          : [{ type: 'Reward', id: 'LIST' }],
    }),
    getRewardsCatalog: builder.query({
      query: () => ({
        url: '/api/client/rewards/catalog',
        method: 'GET',
      }),
      transformResponse: (envelope) => rewardsCatalogFromApi(envelope?.data),
      providesTags: [{ type: 'Reward', id: 'CATALOG' }],
    }),
  }),
})

export const useGetRewardsQuery = rewardsApi.useGetRewardsQuery
export const useGetRewardsCatalogQuery = rewardsApi.useGetRewardsCatalogQuery
