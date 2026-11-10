import { createSlice } from '@reduxjs/toolkit'

// Messages the user sends, until the messages API is connected.
const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    created: [],
  },
  reducers: {
    messageCreated(state, { payload }) {
      state.created.unshift(payload)
    },
  },
})

export const { messageCreated } = messagesSlice.actions
export default messagesSlice.reducer
