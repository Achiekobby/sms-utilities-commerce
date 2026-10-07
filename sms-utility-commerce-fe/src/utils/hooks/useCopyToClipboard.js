import { useEffect, useRef, useState } from 'react'

export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(String(text))
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetAfter)
      return true
    } catch {
      setCopied(false)
      return false
    }
  }

  return { copied, copy }
}
