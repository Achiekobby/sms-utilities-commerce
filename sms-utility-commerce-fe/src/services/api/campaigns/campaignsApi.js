import { pageResult } from '../../../features/contacts/contactImport'
import { campaignFromApi } from '../../../pages/customer/campaigns/fromApi'
import { analyticsFromApi, eventFromApi } from '../../../pages/customer/campaigns/insights'
import { baseApi } from '../baseApi'

const actionFallback = {
  activate: 'Campaign activated.',
  pause: 'Campaign paused.',
  resume: 'Campaign resumed.',
  complete: 'Campaign completed.',
  cancel: 'Campaign cancelled.',
}

function joined(values) {
  return (Array.isArray(values) ? values : []).map((value) => String(value ?? '').trim()).filter(Boolean).join(',')
}

function campaignParams({
  page = 1,
  perPage = 6,
  search = '',
  type = '',
  status = '',
  sender = '',
  reward = '',
  rewardType = '',
} = {}) {
  const params = { page, per_page: perPage }
  const term = String(search ?? '').trim()
  const typeValue = joined(Array.isArray(type) ? type : [type])
  const statusValue = joined(Array.isArray(status) ? status : [status])
  const senderValue = joined(Array.isArray(sender) ? sender : [sender])
  const rewardTypeValue = joined(Array.isArray(rewardType) ? rewardType : [rewardType])

  if (term) params.search = term
  if (typeValue) params.type = typeValue
  if (statusValue) params.status = statusValue
  if (senderValue) params.sender = senderValue
  if (reward === 'with') params.reward_enabled = 1
  if (reward === 'without') params.reward_enabled = 0
  if (rewardTypeValue) params.reward_type = rewardTypeValue
  return params
}

export const campaignsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCampaigns: builder.query({
      query: (args = {}) => ({
        url: '/api/client/campaigns',
        method: 'GET',
        params: campaignParams(args),
      }),
      transformResponse: (envelope) => pageResult(envelope, campaignFromApi),
      providesTags: (result) =>
        result?.rows?.length
          ? [...result.rows.map((row) => ({ type: 'Campaign', id: row.id })), { type: 'Campaign', id: 'LIST' }]
          : [{ type: 'Campaign', id: 'LIST' }],
    }),
    createCampaign: builder.mutation({
      query: (body) => ({
        url: '/api/client/campaigns',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        campaign: campaignFromApi(envelope?.data),
        message: envelope?.message || 'Campaign saved as draft.',
      }),
      invalidatesTags: (result) => [
        { type: 'Campaign', id: 'LIST' },
        ...(result?.campaign?.id ? [{ type: 'Campaign', id: result.campaign.id }] : []),
      ],
    }),
    updateCampaign: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/client/campaigns/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (envelope) => ({
        campaign: campaignFromApi(envelope?.data),
        message: envelope?.message || 'Campaign updated.',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Campaign', id: 'LIST' },
        { type: 'Campaign', id: String(arg.id) },
      ],
    }),
    campaignAction: builder.mutation({
      query: ({ id, action }) => ({
        url: `/api/client/campaigns/${id}/${action}`,
        method: 'POST',
      }),
      transformResponse: (envelope, _meta, arg) => ({
        campaign: campaignFromApi(envelope?.data),
        message: envelope?.message || actionFallback[arg.action] || 'Campaign updated.',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Campaign', id: 'LIST' },
        { type: 'Campaign', id: String(arg.id) },
      ],
    }),
    getCampaignAnalytics: builder.query({
      query: (id) => ({
        url: `/api/client/campaigns/${id}/analytics`,
        method: 'GET',
      }),
      transformResponse: (envelope) => analyticsFromApi(envelope?.data),
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id: String(id) }],
    }),
    getCampaignEvents: builder.query({
      query: ({ id, page = 1, perPage = 10 }) => ({
        url: `/api/client/campaigns/${id}/events`,
        method: 'GET',
        params: { page, per_page: perPage },
      }),
      transformResponse: (envelope) => pageResult(envelope, eventFromApi),
      providesTags: (_result, _error, arg) => [{ type: 'Campaign', id: String(arg.id) }],
    }),
    getCampaign: builder.query({
      query: (id) => ({
        url: `/api/client/campaigns/${id}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => campaignFromApi(envelope?.data),
      providesTags: (result, _error, id) => [{ type: 'Campaign', id: result?.id ?? String(id) }],
    }),
  }),
})

export const useGetCampaignsQuery = campaignsApi.useGetCampaignsQuery
export const useGetCampaignQuery = campaignsApi.useGetCampaignQuery
export const useCreateCampaignMutation = campaignsApi.useCreateCampaignMutation
export const useUpdateCampaignMutation = campaignsApi.useUpdateCampaignMutation
export const useCampaignActionMutation = campaignsApi.useCampaignActionMutation
export const useGetCampaignAnalyticsQuery = campaignsApi.useGetCampaignAnalyticsQuery
export const useGetCampaignEventsQuery = campaignsApi.useGetCampaignEventsQuery
