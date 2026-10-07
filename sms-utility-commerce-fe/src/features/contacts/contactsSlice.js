import { createSlice } from '@reduxjs/toolkit'

// Groups the user creates, and the contacts imported into any group, until the contacts API
// is connected. Only plain data lives here; icons and colours are derived when groups are read.
const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    created: [],
    imported: {},
  },
  reducers: {
    // payload: { id, name, description, createdAt }
    groupCreated(state, { payload }) {
      state.created.unshift(payload)
    },
    // payload: { groupId, added, at }
    contactsImported(state, { payload }) {
      const { groupId, added, at } = payload
      const current = state.imported[groupId]
      state.imported[groupId] = { added: (current?.added ?? 0) + added, at }
    },
  },
})

export const { groupCreated, contactsImported } = contactsSlice.actions
export default contactsSlice.reducer
