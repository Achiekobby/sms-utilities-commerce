import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiBookmarkFill, RiGroupFill, RiHeartFill, RiPriceTag3Fill, RiStarFill } from 'react-icons/ri'
import { groupsSynced } from '../../../features/contacts/contactsSlice'
import {
  contactsApi,
  useGetContactGroupQuery,
  useGetContactGroupsQuery,
  useGetTrashedContactGroupsQuery,
} from '../../../services/api/contacts/contactsApi'

// Groups cycle through these looks so each one is easy to tell apart.
const looks = [
  { icon: RiGroupFill, color: '#0B63F6', tint: '#E3EFFD' },
  { icon: RiBookmarkFill, color: '#8B3FE0', tint: '#EEE3FB' },
  { icon: RiPriceTag3Fill, color: '#008859', tint: '#DDF3E6' },
  { icon: RiHeartFill, color: '#E0287D', tint: '#FCE0EC' },
  { icon: RiStarFill, color: '#F26B1D', tint: '#FFE8D8' },
]

function hash(text) {
  let value = 0
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) >>> 0
  }
  return value
}

function present(entry) {
  const count = entry.count ?? 0

  return {
    id: String(entry.id),
    name: entry.name,
    description: entry.description || 'No description yet',
    note: entry.description ?? '',
    tag: entry.name.length > 14 ? `${entry.name.slice(0, 13)}…` : entry.name,
    breakdown: { active: count, pending: 0, unsubscribed: 0, blocked: 0 },
    count,
    updated: entry.updatedAt || entry.createdAt,
    deletedAt: entry.deletedAt || null,
    archivedAt: entry.archivedAt || null,
    ...looks[hash(String(entry.id)) % looks.length],
  }
}

function withImport(group, imported) {
  if (!imported?.added) return group

  return {
    ...group,
    count: group.count + imported.added,
    breakdown: { ...group.breakdown, active: group.breakdown.active + imported.added },
    updated: imported.at,
  }
}

// Groups from the API. A group you just created can appear briefly until the list refetch finishes.
export function useGroups() {
  const dispatch = useDispatch()
  const query = useGetContactGroupsQuery()
  const created = useSelector((state) => state.contacts.created)
  const imported = useSelector((state) => state.contacts.imported)
  const settled = query.isSuccess && !query.isFetching

  const groups = useMemo(() => {
    const loaded = (query.data ?? []).filter((group) => !group.deletedAt)
    const ids = new Set(loaded.map((group) => String(group.id)))
    // After the API answers, only what it returned is shown. Pending local copies are for the
    // short window between create and the list catching up.
    const pending = settled ? [] : created.filter((group) => !ids.has(String(group.id)))

    return [...pending, ...loaded].map((group) => withImport(present(group), imported[String(group.id)]))
  }, [created, imported, query.data, settled])

  useEffect(() => {
    if (!settled) return
    dispatch(groupsSynced((query.data ?? []).filter((group) => !group.deletedAt).map((group) => group.id)))
  }, [dispatch, query.data, settled])

  return {
    groups,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useTrashedGroups() {
  const query = useGetTrashedContactGroupsQuery()
  const imported = useSelector((state) => state.contacts.imported)

  const groups = useMemo(
    () => (query.data ?? []).map((group) => withImport(present(group), imported[String(group.id)])),
    [imported, query.data],
  )

  return {
    groups,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

function missingGroup(error) {
  if (Number(error?.status) === 404) return true
  const reason = error?.data?.reason
  return reason === 'not_found' || reason === 'missing'
}

// One group from GET /api/client/contact-groups/:id. A copy already on the list is shown while this loads.
export function useContactGroup(groupId) {
  const query = useGetContactGroupQuery(groupId, { skip: !groupId })
  const imported = useSelector((state) => state.contacts.imported)
  const listed = useSelector((state) => {
    const list = contactsApi.endpoints.getContactGroups.select()(state)?.data
    return list?.find((item) => String(item.id) === String(groupId)) ?? null
  })
  const notFound = missingGroup(query.error)
  const source = notFound ? null : (query.data ?? listed)

  const group = useMemo(
    () => (source ? withImport(present(source), imported?.[String(groupId)]) : null),
    [imported, groupId, source],
  )

  return {
    group,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError && !notFound && !group,
    error: query.error,
    refetch: query.refetch,
  }
}
