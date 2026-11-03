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

// How long a worker may stay silent before we stop waiting for it. A healthy worker answers within a
// moment, because its first message is sent before any file is read.
const WORKER_START_LIMIT = 6000

const GENERIC_ERROR = 'Something went wrong while checking your file. Please try again.'

// An engine is anything that can take a message and answer through the handler it was created with.
function startWorker(onMessage, onBroken) {
  const worker = new Worker(new URL('./contactsWorker.js', import.meta.url), { type: 'module' })

  worker.onmessage = ({ data }) => onMessage(data)
  worker.onerror = (event) => {
    event.preventDefault()
    onBroken()
  }
  worker.onmessageerror = onBroken

  return {
    post: (message, transfer = []) => worker.postMessage(message, transfer),
    dispose: () => worker.terminate(),
  }
}

// The same checker, run on the page. Slower for huge files, but it cannot fail to start.
async function startOnPage(onMessage) {
  const { createSheetChecker } = await import('./sheetCheck')
  const checker = createSheetChecker((message) => onMessage(message))
  let live = true

  return {
    // Deferred, so the "checking" screen is painted before the page is busy.
    post: (message) => {
      setTimeout(() => {
        if (live) checker.handle(message)
      }, 40)
    },
    dispose: () => {
      live = false
    },
  }
}

// Checks an .xlsx file off the main thread, so even a very large sheet is read and validated without
// blocking the page. If the worker cannot start, or goes quiet, the check silently carries on on the page
// instead, so the user is never left on a spinner. The engine is ended as soon as it has nothing left to do.
export function useSheetCheck() {
  const engineRef = useRef(null)
  const timerRef = useRef(0)
  const runRef = useRef(0)
  const pendingClean = useRef(null)
  const [state, setState] = useState(initial)

  const stop = useCallback(() => {
    clearTimeout(timerRef.current)
    engineRef.current?.dispose()
    engineRef.current = null
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

      // Starts one attempt. The first attempt uses a worker; if that cannot work, a second runs on the page.
      const launch = async (useWorker) => {
        let buffer
        try {
          buffer = await file.arrayBuffer()
        } catch {
          if (run === runRef.current) fail("We couldn't open that file. Please try again.")
          return
        }
        if (run !== runRef.current) return

        let engine = null
        let answered = false
        let analysing = true

        const current = () => run === runRef.current && engineRef.current === engine

        const giveUp = () => {
          if (!current()) return
          if (useWorker && analysing) {
            // The worker never got going, or died mid-check. Do the same work on the page.
            stop()
            launch(false)
          } else {
            fail(GENERIC_ERROR)
          }
        }

        const onMessage = (data) => {
          if (!current()) return
          answered = true
          clearTimeout(timerRef.current)

          if (data.type === 'progress') {
            setState((existing) => ({
              ...existing,
              phase: data.total ? 'checking' : 'reading',
              stage: data.stage,
              percent: data.percent,
              done: data.done,
              total: data.total,
            }))
          } else if (data.type === 'result') {
            analysing = false
            // The engine only has to stay alive if there is something to clean.
            if (!data.result.failed) stop()
            setState({ ...initial, phase: 'done', result: data.result })
          } else if (data.type === 'problem') {
            analysing = false
            stop()
            setState({ ...initial, phase: 'done', problem: data.problem })
          } else if (data.type === 'failure') {
            analysing = false
            fail(data.message)
          } else if (data.type === 'cleaned') {
            const cleanedFile = new File([data.buffer], data.name, { type: XLSX_MIME })
            const waiting = pendingClean.current
            pendingClean.current = null
            stop()
            setState((existing) => ({
              ...existing,
              cleaning: false,
              cleaned: { file: cleanedFile, kept: data.kept, removed: data.removed },
            }))
            waiting?.resolve(cleanedFile)
          }
        }

        try {
          engine = useWorker ? startWorker(onMessage, giveUp) : await startOnPage(onMessage)
        } catch {
          if (useWorker) {
            launch(false)
          } else if (run === runRef.current) {
            fail(GENERIC_ERROR)
          }
          return
        }
        if (run !== runRef.current) {
          engine.dispose()
          return
        }

        engineRef.current = engine
        if (useWorker) {
          timerRef.current = setTimeout(() => {
            if (!answered) giveUp()
          }, WORKER_START_LIMIT)
        }

        try {
          engine.post({ type: 'analyze', buffer, fileName: file.name }, useWorker ? [buffer] : [])
        } catch {
          giveUp()
        }
      }

      launch(true)
    },
    [stop, fail],
  )

  // Asks the engine for a copy of the file with only the good rows. Resolves with the new File.
  const clean = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const engine = engineRef.current
        if (!engine) {
          reject(new Error('The file is no longer loaded.'))
          return
        }
        pendingClean.current = { resolve, reject }
        setState((existing) => ({ ...existing, cleaning: true }))
        engine.post({ type: 'clean' })
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
