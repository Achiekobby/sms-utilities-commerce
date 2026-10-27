import { walletTopUpCompleted, walletTopUpStarted } from './walletSlice'

// Stands in for Hubtel and Paystack until the backend verifies the charge.
// walletApi is the seam that will replace this: start the top-up, then complete it
// from the verified webhook. A second completion of the same reference is ignored.
export function settleTopUp(dispatch, { amount, description }) {
  const reference = crypto.randomUUID()
  dispatch(
    walletTopUpStarted({
      id: crypto.randomUUID(),
      reference,
      type: 'credit',
      reason: 'topup',
      amount,
      balanceAfter: null,
      gateway: null,
      channel: null,
      status: 'pending',
      description,
      createdAt: new Date().toISOString(),
      relatedId: null,
      relatedKind: null,
    }),
  )
  dispatch(walletTopUpCompleted({ reference }))
  return reference
}
