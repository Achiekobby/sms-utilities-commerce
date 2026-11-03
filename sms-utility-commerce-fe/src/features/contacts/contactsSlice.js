import { createSlice } from '@reduxjs/toolkit'

// Local contact-group helpers. The API list is the source of truth; `created` is only a short-lived
// bridge after create until the list refetch lands, and is never persisted.
const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    created: [],
    imported: {},
  },
  reducers: {
    // payload: { id, name, description, count, createdAt }
    groupCreated(state, { payload }) {
      state.created.unshift(payload)
    },
    groupUpdated(state, { payload }) {
      const index = state.created.findIndex((group) => String(group.id) === String(payload.id))
      if (index >= 0) state.created[index] = { ...state.created[index], ...payload }
    },
    groupRemoved(state, { payload }) {
      const id = String(payload)
      state.created = state.created.filter((group) => String(group.id) !== id)
      delete state.imported[id]
    },
    // Keep only groups that still exist on the API. Clears ghosts after a successful list load.
    groupsSynced(state, { payload }) {
      const ids = new Set((payload ?? []).map((id) => String(id)))
      state.created = state.created.filter((group) => ids.has(String(group.id)))
      Object.keys(state.imported).forEach((id) => {
        if (!ids.has(id)) delete state.imported[id]
      })
    },
    // payload: { groupId, added, at }
    contactsImported(state, { payload }) {
      const { groupId, added, at } = payload
      const current = state.imported[groupId]
      state.imported[groupId] = { added: (current?.added ?? 0) + added, at }
    },
  },
})

export const { groupCreated, groupUpdated, groupRemoved, groupsSynced, contactsImported } = contactsSlice.actions
export default contactsSlice.reducer
