import { useCallback, useEffect, useRef, useState } from 'react'
import { XLSX_MIME } from './rules'

const initial = {
  // idle | reading | checking | done | failed
  phase: 'idle',
  stage: '',
  percent: 0,
  done: 0,
  total: 0,
  result: null,
  problem: null,
  error: '',
  cleaning: false,
  cleaned: null,
}

// Checks an .xlsx file in a Web Worker, so even a very large sheet is read and validated without
// blocking the page. The worker is created per file and ended as soon as it has nothing left to do.
export function useSheetCheck() {
  const workerRef = useRef(null)
  const runRef = useRef(0)
  const pendingClean = useRef(null)
  const [state, setState] = useState(initial)

  const stop = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    pendingClean.current?.reject(new Error('Cancelled'))
    pendingClean.current = null
  }, [])

  useEffect(() => stop, [stop])

  const fail = useCallback(
    (message) => {
      stop()
      setState({ ...initial, phase: 'failed', error: message })
    },
    [stop],
  )

  const analyze = useCallback(
    async (file) => {
      stop()
      runRef.current += 1
      const run = runRef.current
      setState({ ...initial, phase: 'reading', stage: 'Opening your file…' })

      let buffer
      try {
        buffer = await file.arrayBuffer()
      } catch {
        fail("We couldn't open that file. Please try again.")
        return
      }
      if (run !== runRef.current) return

      const worker = new Worker(new URL('./contactsWorker.js', import.meta.url), { type: 'module' })
      workerRef.current = worker

      worker.onmessage = ({ data }) => {
        if (run !== runRef.current) return

        if (data.type === 'progress') {
          setState((current) => ({
            ...current,
            phase: data.total ? 'checking' : 'reading',
            stage: data.stage,
            percent: data.percent,
            done: data.done,
            total: data.total,
          }))
        } else if (data.type === 'result') {
          // The worker only has to stay alive if there is something to clean.
          if (!data.result.failed) stop()
          setState({ ...initial, phase: 'done', result: data.result })
        } else if (data.type === 'problem') {
          stop()
          setState({ ...initial, phase: 'done', problem: data.problem })
        } else if (data.type === 'failure') {
          fail(data.message)
        } else if (data.type === 'cleaned') {
          const cleanedFile = new File([data.buffer], data.name, { type: XLSX_MIME })
          const waiting = pendingClean.current
          pendingClean.current = null
          stop()
          setState((current) => ({
            ...current,
            cleaning: false,
            cleaned: { file: cleanedFile, kept: data.kept, removed: data.removed },
          }))
          waiting?.resolve(cleanedFile)
        }
      }

      worker.onerror = () => {
        if (run === runRef.current) fail('Something went wrong while checking your file. Please try again.')
      }

      worker.postMessage({ type: 'analyze', buffer, fileName: file.name }, [buffer])
    },
    [stop, fail],
  )

  // Asks the worker for a copy of the file with only the good rows. Resolves with the new File.
  const clean = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const worker = workerRef.current
        if (!worker) {
          reject(new Error('The file is no longer loaded.'))
          return
        }
        pendingClean.current = { resolve, reject }
        setState((current) => ({ ...current, cleaning: true }))
        worker.postMessage({ type: 'clean' })
      }),
    [],
  )

  const reset = useCallback(() => {
    stop()
    runRef.current += 1
    setState(initial)
  }, [stop])

  return { ...state, analyze, clean, reset }
}
