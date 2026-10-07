import { useEffect, useState } from 'react'

const desktopQuery = '(min-width: 1024px)'

export function useMediaQuery(query) {
  const [state, setState] = useState(() => ({
    query,
    matches: window.matchMedia(query).matches,
  }))

  if (state.query !== query) {
    setState({ query, matches: window.matchMedia(query).matches })
  }

  useEffect(() => {
    const media = window.matchMedia(query)

    function onChange() {
      setState({ query, matches: media.matches })
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return state.matches
}

export function useIsDesktop() {
  return useMediaQuery(desktopQuery)
}
