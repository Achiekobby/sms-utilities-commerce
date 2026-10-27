import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { seededSenderIds } from './data'

function byRequested(a, b) {
  return b.requestedAt.localeCompare(a.requestedAt)
}

export function useSenderIds() {
  const created = useSelector((state) => state.senderIds.created)

  return useMemo(() => [...created, ...seededSenderIds].sort(byRequested), [created])
}
