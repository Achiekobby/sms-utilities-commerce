import { pageResult } from '../../../features/contacts/contactImport'
import { publicSurveyFromApi } from '../../../pages/public/publicSurvey'
import { questionsFromApi, responseFromApi, surveyFromApi } from '../../../features/surveys/surveyRecord'
import { surveyAnalyticsFromApi } from '../../../pages/customer/surveys/insights'
import { baseApi } from '../baseApi'

export const SURVEY_PAGE_SIZE = 3

function listParams({ page = 1, perPage = SURVEY_PAGE_SIZE } = {}) {
  return { page, per_page: perPage }
}

export const surveysApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSurveys: builder.query({
      query: (args = {}) => ({
        url: '/api/client/surveys',
        method: 'GET',
        params: listParams(args),
      }),
      transformResponse: (envelope) => pageResult(envelope, surveyFromApi),
      providesTags: (result) =>
        result?.rows?.length
          ? [...result.rows.map((row) => ({ type: 'Survey', id: row.id })), { type: 'Survey', id: 'LIST' }]
          : [{ type: 'Survey', id: 'LIST' }],
    }),
    getTrashedSurveys: builder.query({
      query: (args = {}) => ({
        url: '/api/client/surveys/trashed',
        method: 'GET',
        params: listParams(args),
      }),
      transformResponse: (envelope) => pageResult(envelope, surveyFromApi),
      providesTags: (result) =>
        result?.rows?.length
          ? [...result.rows.map((row) => ({ type: 'Survey', id: row.id })), { type: 'Survey', id: 'TRASH' }]
          : [{ type: 'Survey', id: 'TRASH' }],
    }),
    getSurvey: builder.query({
      query: (id) => ({
        url: `/api/client/surveys/${id}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => surveyFromApi(envelope?.data),
      providesTags: (result, _error, id) => [{ type: 'Survey', id: result?.id ?? String(id) }],
    }),
    getSurveyQuestions: builder.query({
      query: (id) => ({
        url: `/api/client/surveys/${id}/questions`,
        method: 'GET',
      }),
      transformResponse: (envelope) => questionsFromApi(envelope?.data),
      providesTags: (_result, _error, id) => [{ type: 'Survey', id: String(id) }],
    }),
    getSurveyResponses: builder.query({
      query: ({ id, page = 1, perPage = 10 }) => ({
        url: `/api/client/surveys/${id}/responses`,
        method: 'GET',
        params: { page, per_page: perPage },
      }),
      transformResponse: (envelope) => pageResult(envelope, responseFromApi),
      providesTags: (_result, _error, arg) => [{ type: 'Survey', id: String(arg.id) }],
    }),
    getSurveyAnalytics: builder.query({
      query: (id) => ({
        url: `/api/client/surveys/${id}/analytics`,
        method: 'GET',
      }),
      transformResponse: (envelope) => surveyAnalyticsFromApi(envelope?.data),
      providesTags: (_result, _error, id) => [{ type: 'Survey', id: String(id) }],
    }),
    createSurvey: builder.mutation({
      query: (body) => ({
        url: '/api/client/surveys',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        survey: surveyFromApi(envelope?.data),
        message: envelope?.message || 'Survey created.',
      }),
      invalidatesTags: [{ type: 'Survey', id: 'LIST' }],
    }),
    updateSurvey: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/client/surveys/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (envelope) => ({
        survey: surveyFromApi(envelope?.data),
        message: envelope?.message || 'Survey updated.',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Survey', id: 'LIST' },
        { type: 'Survey', id: String(arg.id) },
      ],
    }),
    surveyAction: builder.mutation({
      query: ({ id, action }) => ({
        url: `/api/client/surveys/${id}/${action}`,
        method: 'POST',
        body: {},
      }),
      transformResponse: (envelope, _meta, arg) => ({
        survey: surveyFromApi(envelope?.data),
        message:
          envelope?.message ||
          ({
            activate: 'Survey activated.',
            pause: 'Survey paused.',
            resume: 'Survey resumed.',
            complete: 'Survey completed.',
            cancel: 'Survey cancelled.',
          }[arg.action] || 'Survey updated.'),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Survey', id: 'LIST' },
        { type: 'Survey', id: String(arg.id) },
      ],
    }),
    archiveSurvey: builder.mutation({
      query: (id) => ({
        url: `/api/client/surveys/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => ({
        message: envelope?.message || 'Survey deleted.',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Survey', id: 'LIST' },
        { type: 'Survey', id: 'TRASH' },
        { type: 'Survey', id: String(id) },
      ],
    }),
    restoreSurvey: builder.mutation({
      query: (id) => ({
        url: `/api/client/surveys/${id}/restore`,
        method: 'POST',
        body: {},
      }),
      transformResponse: (envelope) => ({
        survey: surveyFromApi(envelope?.data),
        message: envelope?.message || 'Survey restored.',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Survey', id: 'LIST' },
        { type: 'Survey', id: 'TRASH' },
        { type: 'Survey', id: String(id) },
      ],
    }),
    getPublicSurvey: builder.query({
      query: (id) => ({
        url: `/api/public/surveys/${encodeURIComponent(id)}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => publicSurveyFromApi(envelope?.data),
    }),
    submitPublicSurvey: builder.mutation({
      query: ({ id, answers }) => ({
        url: `/api/public/surveys/${encodeURIComponent(id)}/responses`,
        method: 'POST',
        body: { answers },
      }),
      transformResponse: (envelope) => ({
        message: envelope?.message || 'Thanks, your response was submitted.',
      }),
    }),
    forceDeleteSurvey: builder.mutation({
      query: (id) => ({
        url: `/api/client/surveys/${id}/force`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => ({
        message: envelope?.message || 'Survey and its associated records permanently deleted.',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Survey', id: 'LIST' },
        { type: 'Survey', id: 'TRASH' },
        { type: 'Survey', id: String(id) },
      ],
    }),
  }),
})

export const useGetSurveysQuery = surveysApi.useGetSurveysQuery
export const useGetTrashedSurveysQuery = surveysApi.useGetTrashedSurveysQuery
export const useGetSurveyQuery = surveysApi.useGetSurveyQuery
export const useGetSurveyQuestionsQuery = surveysApi.useGetSurveyQuestionsQuery
export const useGetSurveyResponsesQuery = surveysApi.useGetSurveyResponsesQuery
export const useGetSurveyAnalyticsQuery = surveysApi.useGetSurveyAnalyticsQuery
export const useCreateSurveyMutation = surveysApi.useCreateSurveyMutation
export const useUpdateSurveyMutation = surveysApi.useUpdateSurveyMutation
export const useSurveyActionMutation = surveysApi.useSurveyActionMutation
export const useArchiveSurveyMutation = surveysApi.useArchiveSurveyMutation
export const useRestoreSurveyMutation = surveysApi.useRestoreSurveyMutation
export const useForceDeleteSurveyMutation = surveysApi.useForceDeleteSurveyMutation
export const useGetPublicSurveyQuery = surveysApi.useGetPublicSurveyQuery
export const useSubmitPublicSurveyMutation = surveysApi.useSubmitPublicSurveyMutation
