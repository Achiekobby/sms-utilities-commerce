import { useEffect } from 'react'

// Calls `handler` when a pointer goes down outside `ref`. Only listens while `active`.
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined

    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) handler()
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [ref, handler, active])
}
