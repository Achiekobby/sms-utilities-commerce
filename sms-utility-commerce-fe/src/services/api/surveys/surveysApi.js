import { pageResult } from '../../../features/contacts/contactImport'
import { questionsFromApi, surveyFromApi } from '../../../features/surveys/surveyRecord'
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
    deleteSurvey: builder.mutation({
      query: (id) => ({
        url: `/api/client/surveys/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => ({
        message: envelope?.message || 'Survey removed.',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Survey', id: 'LIST' },
        { type: 'Survey', id: String(id) },
      ],
    }),
  }),
})

export const useGetSurveysQuery = surveysApi.useGetSurveysQuery
export const useGetSurveyQuery = surveysApi.useGetSurveyQuery
export const useGetSurveyQuestionsQuery = surveysApi.useGetSurveyQuestionsQuery
export const useCreateSurveyMutation = surveysApi.useCreateSurveyMutation
export const useUpdateSurveyMutation = surveysApi.useUpdateSurveyMutation
export const useDeleteSurveyMutation = surveysApi.useDeleteSurveyMutation
