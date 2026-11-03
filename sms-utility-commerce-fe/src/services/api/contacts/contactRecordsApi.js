import { contactBody, contactFromApi } from '../../../features/contacts/contact'
import { contactImportFromApi, pageResult } from '../../../features/contacts/contactImport'
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
      query: ({ groupId, page = 1 }) => ({
        url: `/api/client/contact-groups/${groupId}/contacts`,
        method: 'GET',
        params: { page },
      }),
      transformResponse: (envelope) => pageResult(envelope, contactFromApi),
      providesTags: (result, _error, { groupId }) => [
        { type: 'Contact', id: `LIST-${groupId}` },
        ...(result?.rows ?? []).map((contact) => ({ type: 'Contact', id: contact.id })),
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
  useGetContactQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useUpdateContactDndMutation,
  useDeleteContactMutation,
  useGetContactImportsQuery,
  useGetContactImportQuery,
  useUploadContactsMutation,
} = contactRecordsApi
