import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  verified: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token, verified = false } = action.payload
      state.user = user ?? null
      state.token = token ?? null
      state.verified = Boolean(verified)
    },
    markVerified(state) {
      if (!state.token) return
      state.verified = true
    },
    logout(state) {
      state.user = null
      state.token = null
      state.verified = false
    },
  },
})

export const { setCredentials, markVerified, logout } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectIsVerified = (state) => state.auth.verified === true

export default authSlice.reducer
