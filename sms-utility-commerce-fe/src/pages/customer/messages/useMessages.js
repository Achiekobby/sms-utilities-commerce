import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useGetMessagesQuery } from '../../../services/api/messages/messagesApi'

export function useMessages({ page = 1, perPage = 15 } = {}) {
  const query = useGetMessagesQuery({ page, perPage })

  return {
    messages: query.data?.rows ?? [],
    page: query.data?.page ?? page,
    perPage: query.data?.perPage ?? perPage,
    total: query.data?.total ?? 0,
    lastPage: query.data?.lastPage ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useMessage(id, seed = null) {
  const key = id == null ? '' : String(id)
  const created = useSelector((state) => state.messages.created)
  const local = useMemo(() => created.find((message) => String(message.id) === key) ?? null, [created, key])
  const seeded = seed && String(seed.id) === key ? seed : null
  // Always load the list so delivery/status stay current after send (local cache can be stale).
  const list = useGetMessagesQuery({ page: 1, perPage: 100 }, { skip: !key })
  const fromList = useMemo(
    () => (list.data?.rows ?? []).find((message) => String(message.id) === key) ?? null,
    [list.data?.rows, key],
  )

  if (!key) return null
  return fromList ?? local ?? seeded ?? null
}
