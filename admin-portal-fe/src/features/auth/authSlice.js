import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  tokenType: 'Bearer',
  expiresAt: null,
  pending: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    beginVerification(state, action) {
      state.user = null
      state.token = null
      state.expiresAt = null
      state.pending = action.payload
    },
    setSession(state, action) {
      const { user, token, tokenType, expiresAt } = action.payload
      state.user = user ?? null
      state.token = token ?? null
      state.tokenType = tokenType || 'Bearer'
      state.expiresAt = expiresAt ?? null
      state.pending = null
    },
    applyProfile(state, action) {
      if (!action.payload) return
      state.user = { ...(state.user ?? {}), ...action.payload }
    },
    logout(state) {
      state.user = null
      state.token = null
      state.tokenType = 'Bearer'
      state.expiresAt = null
      state.pending = null
    },
  },
})

export const { beginVerification, setSession, applyProfile, logout } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectPendingVerification = (state) => state.auth.pending ?? null

export default authSlice.reducer
