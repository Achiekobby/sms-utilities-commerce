import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useGetMessagesQuery, useGetSmsQuery } from '../../../services/api/messages/messagesApi'
import { emptyMessageFilters, messagesQueryParams } from './query'

export function useMessages({ page = 1, perPage = 15, filters = emptyMessageFilters } = {}) {
  const params = messagesQueryParams(filters, { page, perPage })
  const query = useGetMessagesQuery({
    page: params.page,
    perPage: params.per_page,
    contactGroupId: params.contact_group_id ?? '',
    type: params.type ?? '',
    status: params.status ?? '',
    requestType: params.request_type ?? '',
    mode: params.mode ?? '',
    fromDate: params.from_date ?? '',
    toDate: params.to_date ?? '',
  })

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
  const detail = useGetSmsQuery(key, { skip: !key })
  const message = detail.data ?? local ?? seeded ?? null

  return {
    message,
    isLoading: Boolean(key) && detail.isLoading && !message,
    isFetching: detail.isFetching,
    isError: detail.isError,
    error: detail.error,
    refetch: detail.refetch,
  }
}
