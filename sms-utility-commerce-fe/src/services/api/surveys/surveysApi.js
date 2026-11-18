import { pageResult } from '../../../features/contacts/contactImport'
import { surveyFromApi } from '../../../features/surveys/surveyRecord'
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
    updateSurveyQuestions: builder.mutation({
      query: ({ id, questions }) => ({
        url: `/api/client/surveys/${id}/questions`,
        method: 'PUT',
        body: { questions },
      }),
      transformResponse: (envelope) => ({
        survey: surveyFromApi(envelope?.data),
        message: envelope?.message || 'Survey questions updated.',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Survey', id: 'LIST' },
        { type: 'Survey', id: String(arg.id) },
      ],
    }),
  }),
})

export const useGetSurveysQuery = surveysApi.useGetSurveysQuery
export const useCreateSurveyMutation = surveysApi.useCreateSurveyMutation
export const useUpdateSurveyQuestionsMutation = surveysApi.useUpdateSurveyQuestionsMutation
