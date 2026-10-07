import { useState } from 'react'

export function usePagination({ total = 0, pageSize = 10 } = {}) {
  const [page, setPageState] = useState(1)
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1)
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize

  function setPage(next) {
    setPageState(Math.min(Math.max(1, next), pageCount))
  }

  return {
    page: current,
    pageSize,
    pageCount,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total),
    setPage,
    next() {
      setPage(current + 1)
    },
    previous() {
      setPage(current - 1)
    },
  }
}
