import { createSlice } from '@reduxjs/toolkit'

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    entries: [],
  },
  reducers: {
    walletTopUpStarted(state, { payload }) {
      if (state.entries.some((entry) => entry.reference === payload.reference)) return
      state.entries.unshift(payload)
    },
    walletTopUpCompleted(state, { payload }) {
      const entry = state.entries.find((item) => item.reference === payload.reference)
      if (!entry || entry.status === 'completed') return
      entry.status = 'completed'
      state.balance += entry.amount
      entry.balanceAfter = state.balance
    },
    walletDebited(state, { payload }) {
      if (payload.amount > state.balance) return
      state.balance -= payload.amount
      state.entries.unshift({
        ...payload,
        type: 'debit',
        reason: 'sms',
        gateway: null,
        channel: null,
        status: 'completed',
        balanceAfter: state.balance,
      })
    },
  },
})

export const { walletTopUpStarted, walletTopUpCompleted, walletDebited } = walletSlice.actions

export const selectWalletBalance = (state) => state.wallet.balance

export default walletSlice.reducer
