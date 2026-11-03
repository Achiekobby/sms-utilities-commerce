import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { contactsApi } from '../../../../services/api/contacts/contactsApi'
import { useGetContactImportsQuery } from '../../../../services/api/contacts/contactRecordsApi'

// Loads one page of uploads. While any of them is queued or processing, it keeps asking. When one
// finishes, the contact list, the group count and the summary cards are refreshed.
export function useUploadWatch(groupId, page = 1) {
  const dispatch = useDispatch()
  const seen = useRef(new Set())
  const query = useGetContactImportsQuery({ groupId, page }, { skip: !groupId })
  const refetch = query.refetch
  const rows = query.data?.rows

  useEffect(() => {
    if (!rows) return undefined

    let finished = false
    rows.forEach((item) => {
      if (item.running) {
        seen.current.add(item.id)
        return
      }
      if (!seen.current.has(item.id)) return
      seen.current.delete(item.id)
      finished = true
    })

    if (finished) {
      dispatch(
        contactsApi.util.invalidateTags([
          { type: 'Contact', id: `LIST-${groupId}` },
          { type: 'ContactGroup', id: 'STATS' },
          { type: 'ContactGroup', id: 'LIST' },
          { type: 'ContactGroup', id: String(groupId) },
        ]),
      )
    }

    if (!rows.some((item) => item.running)) return undefined
    const timer = setInterval(() => {
      refetch()
    }, 2000)
    return () => clearInterval(timer)
  }, [dispatch, groupId, refetch, rows])

  return query
}
