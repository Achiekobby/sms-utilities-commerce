import { useEffect, useRef } from 'react'

const errorColor = '#9F1C26'

const campaignFields = [
  ['groupIds', 'Audience', 'campaign-groups'],
  ['name', 'Campaign name', 'campaign-name-input'],
  ['type', 'Type', 'campaign-type'],
  ['sender', 'Sender', 'campaign-sender'],
  ['body', 'Message', 'campaign-body-input'],
  ['sendAt', 'Send time', 'campaign-send-at-input'],
]

export function StepError({ errors, summaryRef, fields = campaignFields }) {
  const items = fields.filter(([key]) => errors[key])
  if (items.length === 0) return null

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="campaign-error-title"
      className="mb-6 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 focus:outline-2 focus:outline-offset-2 focus:outline-blue"
    >
      <h2 id="campaign-error-title" className="text-sm font-semibold" style={{ color: errorColor }}>
        Check these details
      </h2>
      <ul className="mt-2 space-y-1">
        {items.map(([key, label, anchor]) => (
          <li key={key}>
            <a href={`#${anchor}`} className="text-sm underline underline-offset-2" style={{ color: errorColor }}>
              {label}: {errors[key]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function useErrorFocus(attempt) {
  const summaryRef = useRef(null)

  useEffect(() => {
    if (!attempt) return
    summaryRef.current?.focus()
  }, [attempt])

  return summaryRef
}
