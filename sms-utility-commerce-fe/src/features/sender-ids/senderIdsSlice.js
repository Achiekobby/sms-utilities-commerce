import { createSlice } from '@reduxjs/toolkit'

// Sender IDs the business requests, until the sender ID API is connected.
// Sample history stays in the page module and is merged when the list is read.
const senderIdsSlice = createSlice({
  name: 'senderIds',
  initialState: {
    created: [],
  },
  reducers: {
    senderIdRequested(state, { payload }) {
      state.created.unshift(payload)
    },
  },
})

export const { senderIdRequested } = senderIdsSlice.actions
export default senderIdsSlice.reducer
