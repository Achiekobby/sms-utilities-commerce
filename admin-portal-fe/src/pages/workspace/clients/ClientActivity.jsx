import { ScrollText } from 'lucide-react'
import { useState } from 'react'
import { emptyActivityFilters } from '../../../features/activity-logs/activityModel'
import { ActivityLogBrowser } from '../activity-logs/ActivityLogBrowser'

export function ClientActivity({ clientId }) {
  const [filters, setFilters] = useState(emptyActivityFilters)
  const [page, setPage] = useState(1)

  return (
    <section className="mt-4" aria-labelledby="client-activity-title">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F6FB] text-navy">
          <ScrollText size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <h2 id="client-activity-title" className="text-lg font-bold tracking-tight text-navy">
            Activity
          </h2>
          <p className="mt-0.5 text-sm text-ink/55">What this client did, and what was done on their account.</p>
        </div>
      </div>
      <ActivityLogBrowser
        clientId={clientId}
        filters={filters}
        page={page}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
        onPage={setPage}
      />
    </section>
  )
}
