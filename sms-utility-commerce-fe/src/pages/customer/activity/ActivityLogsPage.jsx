import { useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatStamp } from '../../../features/contacts/contactImport'
import { useGetActivityLogsQuery } from '../../../services/api/activity/activityApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { PageBar } from '../contacts/sections/PageBar'
import { ActivityDetailsDrawer } from './sections/ActivityDetailsDrawer'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head =
  'border-b border-[#E1EAF6] bg-[#F3F7FD] px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase first:pl-4 last:pr-4'
const cell = 'border-b border-[#E7EEF8] px-3 py-3 align-middle text-sm text-ink/75 first:pl-4 last:pr-4'

function ActionBadge({ action, label }) {
  const positive = action === 'created' || action === 'verified'
  const tone = positive ? 'bg-[#E5F6EC] text-green' : 'bg-[#F3F6FB] text-navy'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {label || '—'}
    </span>
  )
}

function DetailsButton({ entry, onOpen, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      aria-label={`View details for ${entry.title || 'activity'}`}
      className={`cursor-pointer text-sm font-semibold text-blue hover:text-navy ${focusClass} ${className}`}
    >
      View details
    </button>
  )
}

export function ActivityLogsPage() {
  useDocumentTitle('Activity logs')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const query = useGetActivityLogsQuery({ page })
  const rows = query.data?.rows ?? []
  const lastPage = query.data?.lastPage ?? 1
  if (lastPage && page > lastPage) setPage(lastPage)

  return (
    <div className="w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Activity logs</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Review recent activity and security-related events on your account.
        </p>
      </header>

      <section aria-labelledby="activity-heading" className="mt-6" aria-busy={query.isFetching}>
        <h2 id="activity-heading" className="sr-only">
          Recent activity
        </h2>

        {query.isLoading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">Loading activity logs</span>
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} className="skeleton block h-12 rounded-lg" />
            ))}
          </div>
        ) : null}

        {query.isError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
            <button
              type="button"
              onClick={query.refetch}
              className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/15 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-navy">No activity yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
              Account activity will appear here as you use the platform.
            </p>
          </div>
        ) : null}

        {rows.length ? (
          <>
            <div className={`hidden overflow-x-auto rounded-lg border border-ink/10 md:block ${query.isFetching ? 'opacity-60' : ''}`}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className={head}>Activity</th>
                    <th className={head}>Module</th>
                    <th className={head}>Action</th>
                    <th className={head}>Details</th>
                    <th className={head}>Date</th>
                    <th className={head}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr key={entry.id}>
                      <td className={`${cell} font-semibold text-navy`}>{entry.title || 'Activity'}</td>
                      <td className={cell}>{entry.moduleLabel || '—'}</td>
                      <td className={cell}>
                        {entry.actionLabel ? <ActionBadge action={entry.action} label={entry.actionLabel} /> : '—'}
                      </td>
                      <td className={cell}>{entry.details || '—'}</td>
                      <td className={`${cell} whitespace-nowrap text-ink/60`}>{formatStamp(entry.createdAt) || '—'}</td>
                      <td className={`${cell} text-right`}>
                        <DetailsButton entry={entry} onOpen={setSelected} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className={`divide-y divide-[#E7EEF8] rounded-lg border border-ink/10 md:hidden ${query.isFetching ? 'opacity-60' : ''}`}>
              {rows.map((entry) => (
                <li key={entry.id} className="px-3 py-3">
                  <p className="text-sm font-semibold text-navy">{entry.title || 'Activity'}</p>
                  <p className="mt-1 text-[13px] text-ink/70">
                    {[entry.moduleLabel, entry.actionLabel].filter(Boolean).join(' · ') || '—'}
                  </p>
                  {entry.details ? <p className="mt-1 text-[13px] text-ink/60">{entry.details}</p> : null}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-ink/45">{formatStamp(entry.createdAt) || '—'}</p>
                    <DetailsButton entry={entry} onOpen={setSelected} />
                  </div>
                </li>
              ))}
            </ul>

            <PageBar
              page={query.data?.page ?? page}
              lastPage={lastPage}
              total={query.data?.total ?? 0}
              perPage={query.data?.perPage ?? 15}
              onPage={setPage}
              label="Activity log pages"
            />
          </>
        ) : null}
      </section>

      {selected ? <ActivityDetailsDrawer entry={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}
