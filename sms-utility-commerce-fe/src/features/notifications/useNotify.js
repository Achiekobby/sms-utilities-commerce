import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { notify } from 'reapop'

export function useNotify() {
  const dispatch = useDispatch()

  return useMemo(
    () => ({
      success(message, options) {
        if (!message) return
        dispatch(notify(String(message), 'success', options))
      },
      error(message, options) {
        if (!message) return
        dispatch(notify(String(message), 'error', options))
      },
      info(message, options) {
        if (!message) return
        dispatch(notify(String(message), 'info', options))
      },
      warning(message, options) {
        if (!message) return
        dispatch(notify(String(message), 'warning', options))
      },
    }),
    [dispatch],
  )
}
