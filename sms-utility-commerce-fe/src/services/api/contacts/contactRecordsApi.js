import { contactBody, contactFromApi } from '../../../features/contacts/contact'
import { contactImportFromApi, pageResult, skippedRowFromApi } from '../../../features/contacts/contactImport'
import { contactsApi } from './contactsApi'

function groupTags(groupId) {
  return [
    { type: 'Contact', id: `LIST-${groupId}` },
    { type: 'ContactGroup', id: 'STATS' },
    { type: 'ContactGroup', id: 'LIST' },
    { type: 'ContactGroup', id: String(groupId) },
  ]
}

export const contactRecordsApi = contactsApi.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: ({ groupId, page = 1, perPage = 15, search = '', dnd = 'all' }) => {
        const params = { page, per_page: perPage }
        const term = String(search ?? '').trim()
        if (term) params.search = term
        if (dnd === 'active' || dnd === 'inactive') params.dnd_status = dnd
        return {
          url: `/api/client/contact-groups/${groupId}/contacts`,
          method: 'GET',
          params,
        }
      },
      transformResponse: (envelope) => pageResult(envelope, contactFromApi),
      providesTags: (result, _error, { groupId }) => [
        { type: 'Contact', id: `LIST-${groupId}` },
        ...(result?.rows ?? []).map((contact) => ({ type: 'Contact', id: contact.id })),
      ],
    }),
    getUploadContacts: builder.query({
      query: ({ groupId, importId, page = 1 }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/upload/${importId}/contacts`,
        method: 'GET',
        params: { page },
      }),
      transformResponse: (envelope) => pageResult(envelope, contactFromApi),
      providesTags: (result, _error, { groupId, importId }) => [
        { type: 'Contact', id: `LIST-${groupId}` },
        { type: 'Contact', id: `LIST-${groupId}-IMPORT-${importId}` },
        ...(result?.rows ?? []).map((contact) => ({ type: 'Contact', id: contact.id })),
      ],
    }),
    getUploadSkippedRows: builder.query({
      query: ({ groupId, importId, page = 1 }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/upload/${importId}/skipped`,
        method: 'GET',
        params: { page },
      }),
      transformResponse: (envelope) => pageResult(envelope, skippedRowFromApi),
      providesTags: (_result, _error, { importId }) => [{ type: 'ContactImport', id: `SKIPPED-${importId}` }],
    }),
    deleteContactImport: builder.mutation({
      query: ({ groupId, importId }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/upload/${importId}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => envelope?.message || 'Upload deleted.',
      invalidatesTags: (_result, _error, { groupId, importId }) => [
        { type: 'ContactImport', id: `LIST-${groupId}` },
        { type: 'ContactImport', id: String(importId) },
        { type: 'Contact', id: `LIST-${groupId}` },
        { type: 'Contact', id: `LIST-${groupId}-IMPORT-${importId}` },
        { type: 'ContactImport', id: `SKIPPED-${importId}` },
      ],
    }),
    deleteUploadContact: builder.mutation({
      query: ({ groupId, importId, contactId }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/upload/${importId}`,
        method: 'DELETE',
        params: { contact_id: contactId },
      }),
      transformResponse: (envelope) => envelope?.message || 'Contact removed from this upload.',
      invalidatesTags: (_result, _error, { groupId, importId, contactId }) => [
        ...groupTags(groupId),
        { type: 'Contact', id: String(contactId) },
        { type: 'Contact', id: `LIST-${groupId}-IMPORT-${importId}` },
        { type: 'ContactImport', id: `LIST-${groupId}` },
        { type: 'ContactImport', id: String(importId) },
      ],
    }),
    getContact: builder.query({
      query: ({ groupId, contactId }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/${contactId}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => contactFromApi(envelope?.data),
      providesTags: (result, _error, { contactId }) => [{ type: 'Contact', id: result?.id ?? String(contactId) }],
    }),
    createContact: builder.mutation({
      query: ({ groupId, values }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts`,
        method: 'POST',
        body: contactBody(values),
      }),
      transformResponse: (envelope) => ({
        contact: contactFromApi(envelope?.data),
        message: envelope?.message || 'Contact added.',
      }),
      invalidatesTags: (_result, _error, { groupId }) => groupTags(groupId),
    }),
    updateContact: builder.mutation({
      query: ({ groupId, contactId, values }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/${contactId}`,
        method: 'PUT',
        body: contactBody(values),
      }),
      transformResponse: (envelope) => ({
        contact: contactFromApi(envelope?.data),
        message: envelope?.message || 'Contact updated.',
      }),
      invalidatesTags: (result, _error, { groupId, contactId }) => [
        { type: 'Contact', id: `LIST-${groupId}` },
        { type: 'Contact', id: result?.contact?.id ?? String(contactId) },
        ...(result?.contact?.importId
          ? [{ type: 'Contact', id: `LIST-${groupId}-IMPORT-${result.contact.importId}` }]
          : []),
      ],
    }),
    updateContactDnd: builder.mutation({
      query: ({ groupId, contactId, active }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/${contactId}/dnd`,
        method: 'PATCH',
        body: { dnd_status: active ? 'active' : 'inactive' },
      }),
      transformResponse: (envelope) => ({
        contact: contactFromApi(envelope?.data),
        message: envelope?.message || 'DND updated.',
      }),
      invalidatesTags: (result, _error, { groupId, contactId }) => [
        { type: 'Contact', id: `LIST-${groupId}` },
        { type: 'Contact', id: result?.contact?.id ?? String(contactId) },
        ...(result?.contact?.importId
          ? [{ type: 'Contact', id: `LIST-${groupId}-IMPORT-${result.contact.importId}` }]
          : []),
      ],
    }),
    deleteContact: builder.mutation({
      query: ({ groupId, contactId }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/${contactId}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => envelope?.message || 'Contact removed from this group.',
      invalidatesTags: (_result, _error, { groupId, contactId }) => [
        ...groupTags(groupId),
        { type: 'Contact', id: String(contactId) },
      ],
    }),
    getContactImports: builder.query({
      query: ({ groupId, page = 1 }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/upload`,
        method: 'GET',
        params: { page },
      }),
      transformResponse: (envelope) => pageResult(envelope, contactImportFromApi),
      providesTags: (result, _error, { groupId }) => [
        { type: 'ContactImport', id: `LIST-${groupId}` },
        ...(result?.rows ?? []).map((item) => ({ type: 'ContactImport', id: item.id })),
      ],
    }),
    getContactImport: builder.query({
      query: ({ groupId, importId }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts/upload/${importId}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => contactImportFromApi(envelope?.data),
      providesTags: (result, _error, { importId }) => [{ type: 'ContactImport', id: result?.id ?? String(importId) }],
    }),
    uploadContacts: builder.mutation({
      query: ({ groupId, file }) => {
        const body = new FormData()
        body.append('file', file)
        return {
          url: `/api/client/contact-groups/${groupId}/contacts/upload`,
          method: 'POST',
          body,
        }
      },
      transformResponse: (envelope) => ({
        item: contactImportFromApi(envelope?.data),
        message: envelope?.message || 'Upload queued.',
      }),
      invalidatesTags: (_result, _error, { groupId }) => [{ type: 'ContactImport', id: `LIST-${groupId}` }],
    }),
  }),
})

export const {
  useGetContactsQuery,
  useGetUploadContactsQuery,
  useGetUploadSkippedRowsQuery,
  useGetContactQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useUpdateContactDndMutation,
  useDeleteContactMutation,
  useDeleteUploadContactMutation,
  useGetContactImportsQuery,
  useGetContactImportQuery,
  useDeleteContactImportMutation,
  useUploadContactsMutation,
} = contactRecordsApi
