import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  verified: false,
  pending: null,
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
      state.pending = null
    },
    markVerified(state) {
      if (!state.token) return
      state.verified = true
    },
    updateProfile(state, action) {
      if (!state.user) return
      Object.assign(state.user, action.payload)
      if (state.user.provider !== 'google' && state.user.email) {
        state.user.identifier = state.user.email
      }
    },
    applyProfile(state, action) {
      const profile = action.payload
      if (!profile) return
      const provider = state.user?.provider
      state.user = {
        ...(state.user ?? {}),
        ...profile,
        provider: provider || profile.provider || 'passwordless',
        identifier: profile.email || state.user?.identifier || null,
      }
      if (profile.isVerified === true) state.verified = true
    },
    beginVerification(state, action) {
      state.user = null
      state.token = null
      state.verified = false
      state.pending = action.payload
    },
    logout(state) {
      state.user = null
      state.token = null
      state.verified = false
      state.pending = null
    },
  },
})

export const { setCredentials, markVerified, updateProfile, applyProfile, beginVerification, logout } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectIsVerified = (state) => state.auth.verified === true
export const selectPendingVerification = (state) => state.auth.pending ?? null

export default authSlice.reducer
