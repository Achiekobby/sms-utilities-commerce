import { BarChart3, Download } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useApiErrorToast } from '../../../../features/notifications/useApiErrorToast'
import { useNotify } from '../../../../features/notifications/useNotify'
import { formatCount } from '../../dashboard/format'
import { PageBar } from '../../contacts/sections/PageBar'
import { useGetCampaignAnalyticsQuery, useGetCampaignEventsQuery } from '../../../../services/api/campaigns/campaignsApi'
import emptyIllustration from '../../../../assets/images/empty_illustrator.png'
import { collectCampaignEvents, downloadInsights } from '../exportInsights'
import {
  activityBuckets,
  eventLabel,
  eventMatches,
  eventTone,
  outcomeSlices,
  performanceSummary,
  volumeRows,
} from '../insights'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'
const tick = { fill: '#8B95A7', fontSize: 12, fontFamily: 'Onest, sans-serif' }
const EVENTS_PAGE = 10

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  const parts = payload.filter((item) => Number(item.value) > 0)
  return (
    <div className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(11,31,91,0.45)]">
      <p className="font-semibold text-navy">{row.label}</p>
      {row.value != null && parts.length < 2 ? (
        <p className="mt-1 text-ink/70 tabular-nums">{formatCount(row.value)}</p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {parts.map((item) => (
            <li key={item.dataKey} className="text-ink/70">
              {item.name} <span className="font-semibold text-navy tabular-nums">{formatCount(item.value)}</span>
            </li>
          ))}
        </ul>
      )}
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

function VolumeChart({ rows, focus, onFocus }) {
  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#E6EDF6" />
          <XAxis type="number" allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={108} tick={tick} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(20,115,230,0.06)' }} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16} onClick={(bar) => onFocus(bar?.payload?.key)}>
            {rows.map((row) => (
              <Cell
                key={row.key}
                fill={row.color}
                cursor="pointer"
                stroke={focus === row.key ? '#062047' : 'transparent'}
                strokeWidth={focus === row.key ? 2 : 0}
              />
            ))}
            <LabelList dataKey="value" position="right" formatter={formatCount} className="fill-navy text-[11px]" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function OutcomeChart({ slices, onFocus }) {
  if (!slices.length) {
    return <p className="text-sm leading-6 text-ink/60">Delivery split appears after the first message is sent.</p>
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
            onClick={(slice) => onFocus(slice?.payload?.key ?? slice?.key)}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={slice.color} cursor="pointer" />
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

function EngagementEmpty({ onViewPerformance }) {
  return (
    <div className="relative px-2 py-8 text-center sm:py-12">
      <img
        src={emptyIllustration}
        alt=""
        className="mx-auto h-auto w-full max-w-[15.5rem]"
      />
      <h3 className="mt-6 text-xl font-bold tracking-tight text-navy">No engagement yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">
        Tracked events will appear here once recipients start interacting with this campaign.
      </p>
      {onViewPerformance ? (
        <button
          type="button"
          onClick={onViewPerformance}
          className={`mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-[#E6EEF8] bg-white px-4 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.04)] hover:bg-[#F7FAFF] ${focusClass}`}
        >
          <BarChart3 size={15} strokeWidth={2.2} aria-hidden="true" />
          View performance
        </button>
      ) : null}
    </div>
  )
}

function ActivityChart({ events }) {
  const buckets = activityBuckets(events)
  if (!buckets.length) return null
  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-navy">When these events happened</h3>
      <p className="mt-1 text-xs leading-5 text-ink/55">Counts on this page, grouped by the minute they were recorded.</p>
      <div className="mt-3 h-56 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E6EDF6" />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval={0} />
            <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(20,115,230,0.06)' }} />
            <Bar dataKey="sent" stackId="events" fill="#1473E6" name="Sent" />
            <Bar dataKey="delivered" stackId="events" fill="#008859" name="Delivered" />
            <Bar dataKey="failed" stackId="events" fill="#E0232E" name="Failed" />
            <Bar dataKey="clicks" stackId="events" fill="#7C5CD6" name="Clicks" />
            <Bar dataKey="other" stackId="events" fill="#8B95A7" radius={[6, 6, 0, 0]} name="Other" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function CampaignInsights({ campaignId, campaignName, panel = 'performance', focus = '', onFocus, onPanel }) {
  const dispatch = useDispatch()
  const notify = useNotify()
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const showPerformance = panel === 'performance'
  const showEngagement = panel === 'engagement'
  const analytics = useGetCampaignAnalyticsQuery(campaignId, { skip: !campaignId || !showPerformance })
  const events = useGetCampaignEventsQuery(
    { id: campaignId, page, perPage: EVENTS_PAGE },
    { skip: !campaignId || !showEngagement },
  )
  useApiErrorToast(analytics.error, showPerformance && analytics.isError && !analytics.isFetching)
  useApiErrorToast(events.error, showEngagement && events.isError && !events.isFetching)
  const stats = analytics.data
  const rows = events.data?.rows ?? []
  const visible = focus ? rows.filter((event) => eventMatches(event.event, focus)) : rows
  const focusLabel = volumeRows(stats ?? {}).find((row) => row.key === focus)?.label

  function toggleFocus(key) {
    const next = key === 'pending' ? 'sent' : key
    if (!next || next === 'eligible') {
      onFocus?.('')
      return
    }
    onFocus?.(focus === next ? '' : next)
  }

  async function exportFile() {
    if (!stats) return
    setExporting(true)
    try {
      const collected = await collectCampaignEvents(dispatch, campaignId)
      downloadInsights({
        campaignName,
        stats,
        events: collected.rows,
        truncated: collected.truncated,
      })
      notify.success(collected.truncated ? 'Insights downloaded. The event list was capped at 2,000 rows.' : 'Insights downloaded.')
    } catch (error) {
      notify.error(apiErrorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      {showPerformance ? (
      <section className={card} aria-labelledby="campaign-performance">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="campaign-performance" className="text-base font-bold text-navy">Performance</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
              {stats ? performanceSummary(stats) : 'How many people were reached, and how they responded.'}
            </p>
          </div>
          <button
            type="button"
            onClick={exportFile}
            disabled={!stats || exporting}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
          >
            <Download size={15} strokeWidth={2.2} aria-hidden="true" />
            {exporting ? 'Preparing…' : 'Export'}
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink/45">
          Export downloads an Excel file with the analytics and every event loaded in the browser.
        </p>

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
          <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
            <div>
              <h3 className="text-sm font-bold text-navy">Reach</h3>
              <p className="mt-1 text-xs leading-5 text-ink/55">Select a bar to open the matching events.</p>
              <VolumeChart rows={volumeRows(stats)} focus={focus} onFocus={toggleFocus} />
            </div>
            <div className="space-y-5">
              <RateMeter
                label="Delivery rate"
                value={stats.deliveryRate}
                hint="Delivered messages as a share of messages sent."
              />
              <RateMeter
                label="Click rate"
                value={stats.clickRate}
                hint="Clicks as a share of messages sent."
              />
              <div>
                <h3 className="text-sm font-bold text-navy">What happened to sent messages</h3>
                <div className="mt-2">
                  <OutcomeChart slices={outcomeSlices(stats)} onFocus={toggleFocus} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
      ) : null}

      {showEngagement ? (
      <section
        className={`${card} ${!events.isLoading && !events.isError && !rows.length ? 'overflow-hidden bg-[radial-gradient(ellipse_at_85%_0%,rgba(214,226,255,0.55),transparent_42%),radial-gradient(ellipse_at_0%_100%,rgba(214,232,255,0.7),transparent_46%)]' : ''}`}
        aria-labelledby="campaign-events"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="campaign-events" className="text-base font-bold text-navy">Engagement</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">Each row is one tracked event for a recipient.</p>
          </div>
          {focusLabel ? (
            <button
              type="button"
              onClick={() => onFocus?.('')}
              className={`text-sm font-semibold text-blue ${focusClass}`}
            >
              Clear {focusLabel} highlight
            </button>
          ) : null}
        </div>

        {events.isLoading ? (
          <div role="status" className="mt-4 space-y-2">
            <span className="sr-only">Loading events</span>
            <span className="skeleton block h-12 rounded-xl" />
            <span className="skeleton block h-12 rounded-xl" />
          </div>
        ) : events.isError ? (
          <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#9F1C26]">Events could not be loaded.</p>
            <button type="button" onClick={events.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : rows.length ? (
          <>
            <ActivityChart events={rows} />
            {focus && !visible.length ? (
              <p className="mt-4 text-sm text-ink/60">None of the events on this page are {focusLabel?.toLowerCase()}.</p>
            ) : null}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs font-medium text-ink/50">
                    {['When', 'Phone', 'Event', 'Contact'].map((label) => (
                      <th key={label} scope="col" className="border-b border-ink/10 px-3 py-2 font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((event) => (
                    <tr key={event.id} className={focus && eventMatches(event.event, focus) ? 'bg-[#F3F8FE]' : undefined}>
                      <td className="border-b border-ink/[0.06] px-3 py-3 whitespace-nowrap text-ink/70">{event.when}</td>
                      <td className="border-b border-ink/[0.06] px-3 py-3 font-mono text-[13px] text-navy">{event.phone || '—'}</td>
                      <td className="border-b border-ink/[0.06] px-3 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${eventTone(event.event)}`}>
                          {eventLabel(event.event)}
                        </span>
                      </td>
                      <td className="border-b border-ink/[0.06] px-3 py-3 tabular-nums text-ink/70">{event.contactId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PageBar
              page={events.data?.page ?? page}
              lastPage={events.data?.lastPage ?? 1}
              total={events.data?.total ?? 0}
              perPage={events.data?.perPage ?? EVENTS_PAGE}
              onPage={setPage}
              label="Campaign events pages"
            />
          </>
        ) : (
          <EngagementEmpty onViewPerformance={onPanel ? () => onPanel('performance') : undefined} />
        )}
      </section>
      ) : null}
    </>
  )
}
