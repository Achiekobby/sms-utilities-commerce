import { useEffect } from 'react'

const productName = 'UtiliSMS'

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${productName}` : productName
    return () => {
      document.title = previous
    }
  }, [title])
}
