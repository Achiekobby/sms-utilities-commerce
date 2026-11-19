import { formatCount } from '../dashboard/format'
import { asPercent } from '../campaigns/insights'

function count(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

export function surveyAnalyticsFromApi(data) {
  const source = data && typeof data === 'object' ? data : {}
  return {
    blasted: count(source.blasted),
    clicks: count(source.clicks),
    responded: count(source.responded),
    notResponded: count(source.not_responded),
    completionRate: asPercent(source.completion_rate),
    responseRate: asPercent(source.response_rate),
    eligible: count(source.eligible_recipients),
  }
}

export const surveyVolumeMetrics = [
  { key: 'eligible', label: 'Eligible', color: '#0B1F5B' },
  { key: 'blasted', label: 'Invited', color: '#1473E6' },
  { key: 'clicks', label: 'Link clicks', color: '#7C5CD6' },
  { key: 'responded', label: 'Responded', color: '#008859' },
  { key: 'notResponded', label: 'Not responded', color: '#8B95A7' },
]

export function surveyVolumeRows(stats) {
  return surveyVolumeMetrics.map((metric) => ({ ...metric, value: stats[metric.key] ?? 0 }))
}

export function surveyOutcomeSlices(stats) {
  return [
    { key: 'responded', label: 'Responded', value: stats.responded, color: '#008859' },
    { key: 'notResponded', label: 'Not responded', value: stats.notResponded, color: '#8B95A7' },
  ].filter((slice) => slice.value > 0)
}

export function surveyFunnelRows(stats) {
  return [
    { key: 'eligible', label: 'Eligible', value: stats.eligible, color: '#0B1F5B' },
    { key: 'blasted', label: 'Invited', value: stats.blasted, color: '#1473E6' },
    { key: 'clicks', label: 'Opened link', value: stats.clicks, color: '#7C5CD6' },
    { key: 'responded', label: 'Responded', value: stats.responded, color: '#008859' },
  ]
}

export function surveyPerformanceSummary(stats) {
  if (!stats) return ''
  if (stats.blasted === 0 && stats.eligible > 0) {
    return `${formatCount(stats.eligible)} people can receive this survey. Nothing has been sent yet.`
  }
  if (stats.blasted === 0) return 'No invitations have been sent yet.'
  if (stats.responded === 0) {
    return `${formatCount(stats.blasted)} invitations sent. No responses yet.`
  }
  return `${formatCount(stats.responded)} of ${formatCount(stats.blasted)} invited people have responded.`
}
