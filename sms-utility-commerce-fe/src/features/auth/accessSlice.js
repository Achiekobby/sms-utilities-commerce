import { createSlice } from '@reduxjs/toolkit'

const accessSlice = createSlice({
  name: 'access',
  initialState: { forceLogin: false },
  reducers: {
    requireLogin(state) {
      state.forceLogin = true
    },
    clearForceLogin(state) {
      state.forceLogin = false
    },
  },
})

export const { requireLogin, clearForceLogin } = accessSlice.actions
export const selectForceLogin = (state) => state.access.forceLogin

export default accessSlice.reducer
