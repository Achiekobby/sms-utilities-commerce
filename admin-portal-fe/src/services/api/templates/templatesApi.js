import { baseApi } from '../baseApi'

function messageOf(envelope, fallback) {
  return typeof envelope?.message === 'string' && envelope.message ? envelope.message : fallback
}

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query({
      query: ({ page = 1, perPage = 15, type = '', status = '', search = '' } = {}) => {
        const params = { page, per_page: perPage }
        if (type) params.type = type
        if (status) params.status = status
        const term = String(search ?? '').trim()
        if (term) params.search = term
        return { url: '/api/admin/templates', params }
      },
      providesTags: (result) => {
        const rows = Array.isArray(result?.data) ? result.data : []
        return [...rows.map((row) => ({ type: 'Template', id: row.id })), { type: 'Template', id: 'LIST' }]
      },
    }),
    getTemplate: builder.query({
      query: (id) => ({ url: `/api/admin/templates/${id}` }),
      transformResponse: (envelope) => envelope?.data ?? null,
      providesTags: (_result, _error, id) => [{ type: 'Template', id }],
    }),
    createTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/admin/templates',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => ({
        data: envelope?.data ?? null,
        message: messageOf(envelope, 'Template created.'),
      }),
      invalidatesTags: [{ type: 'Template', id: 'LIST' }],
    }),
    updateTemplate: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/templates/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (envelope) => ({
        data: envelope?.data ?? null,
        message: messageOf(envelope, 'Template updated.'),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Template', id: 'LIST' },
        { type: 'Template', id },
      ],
    }),
    setTemplateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/templates/${id}`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (envelope) => ({
        data: envelope?.data ?? null,
        message: messageOf(envelope, 'Template status updated.'),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Template', id: 'LIST' },
        { type: 'Template', id },
      ],
    }),
    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/admin/templates/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => ({
        message: messageOf(envelope, 'Template deleted.'),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Template', id: 'LIST' },
        { type: 'Template', id },
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
