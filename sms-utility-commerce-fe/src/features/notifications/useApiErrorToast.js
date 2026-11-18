import { useEffect, useRef } from 'react'
import { apiErrorMessage } from '../auth/client'
import { useNotify } from './useNotify'

export function useApiErrorToast(error, active = true) {
  const notify = useNotify()
  const seen = useRef(null)

  useEffect(() => {
    if (!active || !error) {
      seen.current = null
      return
    }
    const message = apiErrorMessage(error)
    if (!message || seen.current === message) return
    seen.current = message
    notify.error(message)
  }, [active, error, notify])
}
