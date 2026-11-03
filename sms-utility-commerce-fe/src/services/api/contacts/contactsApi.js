import { contactGroupFromApi, contactStatsFromApi } from '../../../features/contacts/group'
import { baseApi } from '../baseApi'

function loadContactGroupPages(url) {
  return async function queryFn(_arg, _api, _extra, baseQuery) {
    const groups = []
    const seen = new Set()
    let page = 1
    let lastPage

    do {
      const result = await baseQuery({
        url,
        method: 'GET',
        params: { page },
      })
      if (result.error) return { error: result.error }

      const envelope = result.data ?? {}
      const rows = Array.isArray(envelope.data) ? envelope.data : []
      for (const row of rows) {
        const group = contactGroupFromApi(row)
        if (!group || seen.has(group.id)) continue
        seen.add(group.id)
        groups.push(group)
      }

      const reported = Number(envelope.pagination?.last_page)
      lastPage = Number.isFinite(reported) && reported > 0 ? reported : 1
      page += 1
    } while (page <= lastPage && page <= 100)

    return { data: groups }
  }
}

function groupOutcome(envelope, fallback) {
  const message = typeof envelope?.message === 'string' && envelope.message.length < 180 ? envelope.message : fallback
  return { group: contactGroupFromApi(envelope?.data), message }
}

function patchGroups(dispatch, endpoint, recipe) {
  try {
    dispatch(contactsApi.util.updateQueryData(endpoint, undefined, recipe))
  } catch {
    // That list is not cached yet. The invalidated tag refetches it when it is open.
  }
}

export const contactsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactGroup: builder.query({
      query: (id) => ({
        url: `/api/client/contact-groups/${id}`,
        method: 'GET',
      }),
      transformResponse: (envelope) => contactGroupFromApi(envelope?.data),
      providesTags: (result, _error, id) => [{ type: 'ContactGroup', id: result?.id ?? String(id) }],
    }),
    getContactGroups: builder.query({
      queryFn: loadContactGroupPages('/api/client/contact-groups'),
      providesTags: (result) =>
        result
          ? [{ type: 'ContactGroup', id: 'LIST' }, ...result.map((group) => ({ type: 'ContactGroup', id: group.id }))]
          : [{ type: 'ContactGroup', id: 'LIST' }],
    }),
    getContactStats: builder.query({
      query: () => ({
        url: '/api/client/contact-groups/stats',
        method: 'GET',
      }),
      transformResponse: (envelope) => contactStatsFromApi(envelope?.data),
      providesTags: [{ type: 'ContactGroup', id: 'STATS' }],
    }),
    getTrashedContactGroups: builder.query({
      queryFn: loadContactGroupPages('/api/client/contact-groups/trashed'),
      providesTags: (result) =>
        result
          ? [{ type: 'ContactGroup', id: 'TRASH' }, ...result.map((group) => ({ type: 'ContactGroup', id: group.id }))]
          : [{ type: 'ContactGroup', id: 'TRASH' }],
    }),
    createContactGroup: builder.mutation({
      query: (body) => ({
        url: '/api/client/contact-groups',
        method: 'POST',
        body,
      }),
      transformResponse: (envelope) => contactGroupFromApi(envelope?.data),
      invalidatesTags: [
        { type: 'ContactGroup', id: 'LIST' },
        { type: 'ContactGroup', id: 'STATS' },
      ],
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (!data) return
          dispatch(contactsApi.util.upsertQueryData('getContactGroup', data.id, data))
          patchGroups(dispatch, 'getContactGroups', (groups) => {
            const index = groups.findIndex((group) => group.id === data.id)
            if (index >= 0) groups[index] = data
            else groups.unshift(data)
          })
        } catch {
          // Invalidated tags refetch the list.
        }
      },
    }),
    updateContactGroup: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/client/contact-groups/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (envelope) => contactGroupFromApi(envelope?.data),
      invalidatesTags: (result, _error, { id }) => [
        { type: 'ContactGroup', id: 'LIST' },
        { type: 'ContactGroup', id: result?.id ?? String(id) },
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (!data) return
          dispatch(contactsApi.util.updateQueryData('getContactGroup', String(id), () => data))
          dispatch(
            contactsApi.util.updateQueryData('getContactGroups', undefined, (groups) => {
              const index = groups.findIndex((group) => group.id === data.id)
              if (index >= 0) groups[index] = data
            }),
          )
        } catch {
          // The tags above refetch the list and the open group.
        }
      },
    }),
    archiveContactGroup: builder.mutation({
      query: (id) => ({
        url: `/api/client/contact-groups/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => groupOutcome(envelope, 'Contact group archived. Contacts were not removed.'),
      invalidatesTags: (result, _error, id) => [
        { type: 'ContactGroup', id: 'LIST' },
        { type: 'ContactGroup', id: 'TRASH' },
        { type: 'ContactGroup', id: 'STATS' },
        { type: 'ContactGroup', id: result?.group?.id ?? String(id) },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const key = String(data?.group?.id ?? id)
          patchGroups(dispatch, 'getContactGroups', (groups) => {
            const index = groups.findIndex((group) => group.id === key)
            if (index >= 0) groups.splice(index, 1)
          })
          if (data?.group) {
            patchGroups(dispatch, 'getTrashedContactGroups', (groups) => {
              const index = groups.findIndex((group) => group.id === data.group.id)
              if (index >= 0) groups[index] = data.group
              else groups.unshift(data.group)
            })
            dispatch(contactsApi.util.updateQueryData('getContactGroup', key, () => data.group))
          }
        } catch {
          // Invalidated tags refetch the lists.
        }
      },
    }),
    restoreContactGroup: builder.mutation({
      query: (id) => ({
        url: `/api/client/contact-groups/${id}/restore`,
        method: 'POST',
        body: {},
      }),
      transformResponse: (envelope) => groupOutcome(envelope, 'Contact group restored.'),
      invalidatesTags: (result, _error, id) => [
        { type: 'ContactGroup', id: 'LIST' },
        { type: 'ContactGroup', id: 'TRASH' },
        { type: 'ContactGroup', id: 'STATS' },
        { type: 'ContactGroup', id: result?.group?.id ?? String(id) },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const key = String(data?.group?.id ?? id)
          patchGroups(dispatch, 'getTrashedContactGroups', (groups) => {
            const index = groups.findIndex((group) => group.id === key)
            if (index >= 0) groups.splice(index, 1)
          })
          if (data?.group) {
            patchGroups(dispatch, 'getContactGroups', (groups) => {
              const index = groups.findIndex((group) => group.id === data.group.id)
              if (index >= 0) groups[index] = data.group
              else groups.unshift(data.group)
            })
            dispatch(contactsApi.util.updateQueryData('getContactGroup', key, () => data.group))
          }
        } catch {
          // Invalidated tags refetch the lists.
        }
      },
    }),
    forceDeleteContactGroup: builder.mutation({
      query: (id) => ({
        url: `/api/client/contact-groups/${id}/force`,
        method: 'DELETE',
      }),
      transformResponse: (envelope) => groupOutcome(envelope, 'Contact group permanently removed.'),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ContactGroup', id: 'TRASH' },
        { type: 'ContactGroup', id: 'LIST' },
        { type: 'ContactGroup', id: 'STATS' },
        { type: 'ContactGroup', id: String(id) },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          const key = String(id)
          patchGroups(dispatch, 'getTrashedContactGroups', (groups) => {
            const index = groups.findIndex((group) => group.id === key)
            if (index >= 0) groups.splice(index, 1)
          })
          patchGroups(dispatch, 'getContactGroups', (groups) => {
            const index = groups.findIndex((group) => group.id === key)
            if (index >= 0) groups.splice(index, 1)
          })
        } catch {
          // Invalidated tags refetch the lists.
        }
      },
    }),
  }),
})

export const {
  useGetContactGroupQuery,
  useGetContactGroupsQuery,
  useGetContactStatsQuery,
  useGetTrashedContactGroupsQuery,
  useCreateContactGroupMutation,
  useUpdateContactGroupMutation,
  useArchiveContactGroupMutation,
  useRestoreContactGroupMutation,
  useForceDeleteContactGroupMutation,
} = contactsApi
