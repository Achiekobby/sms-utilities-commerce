import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { seededMessages } from './data'

function byCreated(a, b) {
  return b.createdAt.localeCompare(a.createdAt)
}

export function useMessages() {
  const created = useSelector((state) => state.messages.created)

  return useMemo(() => [...created, ...seededMessages].sort(byCreated), [created])
}

export function useMessage(id) {
  const messages = useMessages()
  return messages.find((message) => message.id === id) ?? null
}
