import { apiKeyFromApi } from '../../../features/apiKeys/apiKey'
import { baseApi } from '../baseApi'

function tokenFrom(data) {
  if (!data || typeof data !== 'object') return ''
  if (typeof data.token === 'string') return data.token
  if (Array.isArray(data) && typeof data[0]?.token === 'string') return data[0].token
  return ''
}

function tokenResult(envelope, fallbackMessage) {
  return {
    key: apiKeyFromApi(envelope?.data),
    token: tokenFrom(envelope?.data),
    message: envelope?.message || fallbackMessage,
  }
}

export const apiKeysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApiKey: builder.query({
      query: () => ({
        url: '/api/client/api-keys',
        method: 'GET',
      }),
      transformResponse: (envelope) => apiKeyFromApi(envelope?.data),
      providesTags: ['ApiKey'],
    }),
    createApiKey: builder.mutation({
      query: (body = {}) => ({
        url: '/api/client/api-keys',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => tokenResult(envelope, 'API key created.'),
      invalidatesTags: ['ApiKey'],
    }),
    regenerateApiKey: builder.mutation({
      query: () => ({
        url: '/api/client/api-keys/regenerate',
        method: 'POST',
        body: {},
      }),
      transformResponse: (envelope) => tokenResult(envelope, 'API key regenerated.'),
      invalidatesTags: ['ApiKey'],
    }),
  }),
})

export const { useGetApiKeyQuery, useCreateApiKeyMutation, useRegenerateApiKeyMutation } = apiKeysApi
