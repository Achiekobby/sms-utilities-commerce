import { createSlice } from '@reduxjs/toolkit'

// Campaigns the user sends, until the campaigns API is connected.
// Sample history stays in the campaigns page module and is merged when the list is read.
const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: {
    created: [],
  },
  reducers: {
    campaignCreated(state, { payload }) {
      state.created.unshift(payload)
    },
  },
})

export const { campaignCreated } = campaignsSlice.actions
export default campaignsSlice.reducer
