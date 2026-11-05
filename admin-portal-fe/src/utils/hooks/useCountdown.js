import { useEffect, useState } from 'react'

export function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) return undefined
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  function restart(next = seconds) {
    setRemaining(next)
  }

  return { remaining, restart }
}
