import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApiErrorToast } from '../../../features/notifications/useApiErrorToast'
import { useGetSurveyAnalyticsQuery } from '../../../services/api/surveys/surveysApi'
import { formatCount } from '../dashboard/format'
import {
  surveyFunnelRows,
  surveyOutcomeSlices,
  surveyPerformanceSummary,
  surveyVolumeRows,
} from './insights'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-2xl border border-[#E6EEF8] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.04),0_16px_32px_-22px_rgba(11,31,91,0.4)] sm:p-6'
const tick = { fill: '#8B95A7', fontSize: 12, fontFamily: 'Onest, sans-serif' }

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(11,31,91,0.45)]">
      <p className="font-semibold text-navy">{row.label}</p>
      <p className="mt-1 text-ink/70 tabular-nums">{formatCount(row.value)}</p>
    </div>
  )
}

function RateMeter({ label, value, hint }) {
  const width = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-navy">{label}</p>
        <p className="text-sm font-bold text-navy tabular-nums">{value.toFixed(1)}%</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF2F7]" role="presentation">
        <div className="h-full rounded-full bg-blue transition-[width] duration-300" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1.5 text-xs leading-5 text-ink/55">{hint}</p>
    </div>
  )
}

function VolumeChart({ rows }) {
  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#E6EDF6" />
          <XAxis type="number" allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={108} tick={tick} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(20,115,230,0.06)' }} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
            {rows.map((row) => (
              <Cell key={row.key} fill={row.color} />
            ))}
            <LabelList dataKey="value" position="right" formatter={formatCount} className="fill-navy text-[11px]" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function FunnelChart({ rows }) {
  return (
    <div className="h-56 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E6EDF6" />
          <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(20,115,230,0.06)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={28}>
            {rows.map((row) => (
              <Cell key={row.key} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function OutcomeChart({ slices, onSelect }) {
  if (!slices.length) {
    return <p className="text-sm leading-6 text-ink/60">Response split appears after the first invitation is sent.</p>
  }
  return (
    <div className="h-52 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={2}
            onClick={(slice) => onSelect?.(slice?.payload?.key ?? slice?.key)}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={slice.color} cursor={slice.key === 'responded' ? 'pointer' : 'default'} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {slices.map((slice) => (
          <li key={slice.key} className="inline-flex items-center gap-1.5 text-xs text-ink/70">
            <span className="size-2 rounded-full" style={{ backgroundColor: slice.color }} />
            {slice.label}
            <span className="font-semibold text-navy tabular-nums">{formatCount(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SurveyAnalytics({ surveyId, onOpenResponses }) {
  const analytics = useGetSurveyAnalyticsQuery(surveyId, { skip: !surveyId })
  useApiErrorToast(analytics.error, analytics.isError && !analytics.isFetching)
  const stats = analytics.data

  return (
    <section className={card} aria-labelledby="survey-performance">
      <div>
        <h2 id="survey-performance" className="text-base font-bold text-navy">
          Performance
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
          {stats ? surveyPerformanceSummary(stats) : 'How invitations, clicks, and responses compare.'}
        </p>
      </div>

      {analytics.isLoading ? (
        <div role="status" className="mt-4 space-y-2">
          <span className="sr-only">Loading analytics</span>
          <span className="skeleton block h-56 rounded-xl" />
        </div>
      ) : analytics.isError ? (
        <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#9F1C26]">Analytics could not be loaded.</p>
          <button type="button" onClick={analytics.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : stats ? (
        <div className="mt-5 space-y-6">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
            <div>
              <h3 className="text-sm font-bold text-navy">Reach</h3>
              <p className="mt-1 text-xs leading-5 text-ink/55">Who was eligible, invited, clicked, and responded.</p>
              <VolumeChart rows={surveyVolumeRows(stats)} />
            </div>
            <div className="space-y-5">
              <RateMeter
                label="Response rate"
                value={stats.responseRate}
                hint="People who responded as a share of invitations sent."
              />
              <RateMeter
                label="Completion rate"
                value={stats.completionRate}
                hint="Completed surveys as a share of invitations sent."
              />
              <div>
                <h3 className="text-sm font-bold text-navy">Response split</h3>
                <p className="mt-1 text-xs leading-5 text-ink/55">Select Responded to open the responses list.</p>
                <div className="mt-2">
                  <OutcomeChart
                    slices={surveyOutcomeSlices(stats)}
                    onSelect={(key) => {
                      if (key === 'responded') onOpenResponses?.()
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-navy">Invitation funnel</h3>
            <p className="mt-1 text-xs leading-5 text-ink/55">From eligible contacts to completed responses.</p>
            <FunnelChart rows={surveyFunnelRows(stats)} />
          </div>
        </div>
      ) : null}
    </section>
  )
}
