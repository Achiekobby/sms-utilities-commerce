import { pageResult } from '../../../features/contacts/contactImport'
import { templateFromApi } from '../../../features/templates/templateModel'
import { baseApi } from '../baseApi'

function messageOf(envelope, fallback) {
  return typeof envelope?.message === 'string' && envelope.message ? envelope.message : fallback
}

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query({
      query: ({
        page = 1,
        perPage = 15,
        type = '',
        occasionType = '',
        category = '',
        status = '',
        search = '',
        owner = '',
        scope = '',
        includeInactive = false,
      } = {}) => {
        const params = { page, per_page: perPage }
        if (type) params.type = type
        if (occasionType) params.occasion_type = occasionType
        if (category) params.category = category
        if (status) params.status = status
        if (owner) params.owner = owner
        if (scope) params.scope = scope
        const term = String(search ?? '').trim()
        if (term) params.search = term
        if (includeInactive) params.include_inactive = 1
        return {
          url: '/api/client/templates',
          method: 'GET',
          params,
        }
      },
      transformResponse: (envelope) => pageResult(envelope, templateFromApi),
      providesTags: (result) => [
        { type: 'Template', id: 'LIST' },
        ...(result?.rows ?? []).map((row) => ({ type: 'Template', id: row.id })),
      ],
    }),
    getTemplate: builder.query({
      query: (id) => ({
        url: `/api/client/templates/${id}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => templateFromApi(envelope?.data),
      providesTags: (result, _error, id) => [{ type: 'Template', id: result?.id ?? String(id) }],
    }),
    createTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/client/templates',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        template: templateFromApi(envelope?.data),
        message: messageOf(envelope, 'Template created.'),
      }),
      invalidatesTags: [{ type: 'Template', id: 'LIST' }],
    }),
    updateTemplate: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/client/templates/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (envelope) => ({
        template: templateFromApi(envelope?.data),
        message: messageOf(envelope, 'Template updated.'),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Template', id: 'LIST' },
        { type: 'Template', id: String(id) },
      ],
    }),
    setTemplateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/client/templates/${id}`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (envelope) => ({
        template: templateFromApi(envelope?.data),
        message: messageOf(envelope, 'Template status updated.'),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Template', id: 'LIST' },
        { type: 'Template', id: String(id) },
      ],
    }),
    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/client/templates/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => ({
        message: messageOf(envelope, 'Template deleted.'),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Template', id: 'LIST' },
        { type: 'Template', id: String(id) },
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useSetTemplateStatusMutation,
  useDeleteTemplateMutation,
} = templatesApi
