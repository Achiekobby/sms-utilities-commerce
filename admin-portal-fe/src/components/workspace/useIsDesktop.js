import { useEffect, useState } from 'react'

const query = '(min-width: 1024px)'

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return desktop
}
