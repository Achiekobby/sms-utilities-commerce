import { ScrollText } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { usePermissions } from '../../../features/auth/usePermissions'
import { emptyActivityFilters } from '../../../features/activity-logs/activityModel'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { ActivityLogBrowser } from './ActivityLogBrowser'

const permissions = ['activity_log.view']

function readFilters(searchParams) {
  const module = searchParams.get('module') ?? ''
  const actor = searchParams.get('actor') ?? ''
  const action = searchParams.get('action') ?? ''
  const clientId = /^\d+$/.test(searchParams.get('client_id') ?? '') ? searchParams.get('client_id') : ''
  const adminId = /^\d+$/.test(searchParams.get('admin_id') ?? '') ? searchParams.get('admin_id') : ''
  const from = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.get('from') ?? '') ? searchParams.get('from') : ''
  const to = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.get('to') ?? '') ? searchParams.get('to') : ''
  return {
    ...emptyActivityFilters,
    search: searchParams.get('search') ?? '',
    module,
    actor,
    action,
    clientId,
    adminId,
    from,
    to,
  }
}

export function ActivityLogsPage() {
  const access = usePermissions()
  const allowed = access.hasAnyPermission(permissions)
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  if (!allowed) return <AccessDeniedPage />

  function write(nextFilters, nextPage) {
    const params = {}
    if (nextPage > 1) params.page = String(nextPage)
    if (nextFilters.search) params.search = nextFilters.search
    if (nextFilters.module) params.module = nextFilters.module
    if (nextFilters.actor) params.actor = nextFilters.actor
    if (nextFilters.action) params.action = nextFilters.action
    if (nextFilters.clientId) params.client_id = nextFilters.clientId
    if (nextFilters.adminId) params.admin_id = nextFilters.adminId
    if (nextFilters.from) params.from = nextFilters.from
    if (nextFilters.to) params.to = nextFilters.to
    setSearchParams(params, { replace: true })
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)] sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F6FB] text-navy ring-1 ring-navy/10">
            <ScrollText size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">Operations</p>
            <h1 className="mt-0.5 text-[1.75rem] leading-none font-bold tracking-tight text-navy">Activity logs</h1>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">
              What admins, clients, and the system did, including who it affected.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-5">
        <ActivityLogBrowser
          filters={filters}
          page={page}
          onChange={(next) => write(next, 1)}
          onPage={(next) => write(filters, next)}
        />
      </div>
    </div>
  )
}
