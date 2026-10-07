import { useState } from 'react'

// useState that survives a reload. Storage failures (private mode, quota) fall back to memory.
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initial : JSON.parse(stored)
    } catch {
      return initial
    }
  })

  function set(next) {
    setValue((current) => {
      const resolved = typeof next === 'function' ? next(current) : next

      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // Keep the in-memory value.
      }

      return resolved
    })
  }

  return [value, set]
}
