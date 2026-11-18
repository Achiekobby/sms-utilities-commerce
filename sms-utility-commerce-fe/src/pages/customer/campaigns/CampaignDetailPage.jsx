import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CalendarDays,
  ChevronRight,
  CircleOff,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  Link2,
  Megaphone,
  MessageSquare,
  Pencil,
  Repeat,
  Send,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { TypeBadge, typeIcons } from '../../../components/TypeBadge'
import { useApiErrorToast } from '../../../features/notifications/useApiErrorToast'
import { paths } from '../../../routes/paths'
import { useGetCampaignQuery } from '../../../services/api/campaigns/campaignsApi'
import { useGetContactGroupsQuery } from '../../../services/api/contacts/contactsApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { withGroupNames } from './fromApi'
import { CampaignActions } from './sections/CampaignActions'
import { CampaignInsights } from './sections/CampaignInsights'
import { PhonePreview } from './sections/PhonePreview'
import {
  audienceLabel,
  campaignGroups,
  formatCreated,
  formatSendTime,
  scheduleLabel,
  triggerOffsetLabel,
} from './model'
import { formatCtaValue } from './cta'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const viewTabs = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'engagement', label: 'Engagement', icon: Users },
]
const iconButton = `inline-flex size-10 items-center justify-center rounded-xl border border-[#E6EEF8] bg-white text-navy shadow-[0_1px_2px_rgba(16,33,61,0.04)] hover:bg-canvas ${focusClass}`
const card =
  'rounded-2xl border border-[#E6EEF8] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.04),0_16px_32px_-22px_rgba(11,31,91,0.4)] sm:p-6'

function HeaderMark({ type }) {
  const occasion = type === 'occasion'
  const Icon = occasion ? CalendarDays : (typeIcons[type] ?? Megaphone)
  return (
    <span
      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
        occasion ? 'bg-[#FFF1E8] text-[#C2410C]' : 'bg-[#E7F1FC] text-blue'
      }`}
    >
      <Icon size={22} strokeWidth={2.1} aria-hidden="true" />
    </span>
  )
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#EEF3FA] py-3.5 last:border-b-0">
      <Icon size={16} strokeWidth={2} className="shrink-0 text-ink/35" aria-hidden="true" />
      <dt className="text-sm text-ink/65">{label}</dt>
      <dd className="ml-auto min-w-0 text-right text-sm font-medium text-navy">{children}</dd>
    </div>
  )
}

function offsetLabel(campaign) {
  if (campaign.triggerOffset === 'custom') return `${campaign.customOffsetDays ?? '—'} days before`
  return triggerOffsetLabel(campaign.triggerOffset || 'on')
}

function MissingCampaign() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-2xl font-semibold text-navy">Campaign not found</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">That campaign is not in this workspace.</p>
      <Link to={paths.campaigns} className={`mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}>
        <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
        Back to campaigns
      </Link>
    </div>
  )
}

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const location = useLocation()
  const detail = useGetCampaignQuery(campaignId, { skip: !campaignId })
  const groups = useGetContactGroupsQuery()
  const campaign = useMemo(
    () => (detail.data ? withGroupNames(detail.data, groups.data) : null),
    [detail.data, groups.data],
  )
  useApiErrorToast(detail.error, detail.isError && !detail.isFetching)
  useApiErrorToast(groups.error, groups.isError && !groups.isFetching)
  const [tab, setTab] = useState('details')
  const [eventFocus, setEventFocus] = useState('')
  const reduceMotion = useReducedMotion()
  useDocumentTitle(campaign ? campaign.name : 'Campaign')
  const createdBanner = useMemo(() => {
    if (!location.state?.justCreated || !campaign) return null
    if (location.state.outcome === 'activated') {
      return {
        title: 'Campaign activated',
        detail: `${campaign.name} will automatically send when contacts reach their occasion.`,
      }
    }
    if (location.state.outcome === 'scheduled') {
      return {
        title: 'Campaign scheduled',
        detail: `${campaign.name} will be sent to approximately ${formatCount(campaign.recipients)} recipients on ${scheduleLabel(campaign)}.`,
      }
    }
    return {
      title: 'Campaign sent',
      detail: `${campaign.name} is on its way to approximately ${formatCount(campaign.recipients)} recipients.`,
    }
  }, [campaign, location.state])

  if (detail.isLoading) {
    return (
      <div role="status" className="space-y-3">
        <span className="sr-only">Loading campaign</span>
        <span className="skeleton block h-8 w-48 rounded-lg" />
        <span className="skeleton block h-12 w-full max-w-xl rounded-xl" />
        <span className="skeleton block h-64 rounded-xl" />
      </div>
    )
  }

  if (detail.isError) {
    const missing = detail.error?.status === 404
    if (missing) return <MissingCampaign />
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#9F1C26]">This campaign could not be loaded.</p>
        <button type="button" onClick={detail.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
          Try again
        </button>
      </div>
    )
  }

  if (!campaign) return <MissingCampaign />

  const audience = campaignGroups(campaign)
  const isOccasion = campaign.type === 'occasion'
  const canEdit = !['completed', 'cancelled', 'sending'].includes(campaign.status)

  function inspectEvents(key) {
    setEventFocus(key)
    if (key) setTab('engagement')
  }

  return (
    <div className="w-full min-w-0">
      <Link
        to={paths.campaigns}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 text-[13px] font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.04)] hover:bg-canvas ${focusClass}`}
      >
        <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
        Campaigns
      </Link>

      {createdBanner ? (
        <div className="mt-4 rounded-xl border border-[#B7E4C7] bg-[#F3FBF6] px-4 py-3">
          <p className="text-sm font-semibold text-green">{createdBanner.title}</p>
          <p className="mt-0.5 text-sm text-ink/70">{createdBanner.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={paths.campaigns}
              className={`inline-flex h-9 items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
            >
              Back to campaigns
            </Link>
          </div>
        </div>
      ) : null}

      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <HeaderMark type={campaign.type} />
          <span className="hidden h-11 w-px shrink-0 bg-[#E6EEF8] sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-ink/45">Campaign</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-navy">{campaign.name}</h1>
              <TypeBadge type={campaign.type} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CampaignActions campaign={campaign} iconOnly triggerClassName={iconButton} />
          {canEdit ? (
            <Link
              to={paths.editCampaign(campaign.id)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl bg-green px-3 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.2)] hover:bg-[#006B46] ${focusClass}`}
            >
              <Pencil size={15} strokeWidth={2.2} aria-hidden="true" />
              Edit campaign
            </Link>
          ) : null}
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Campaign view"
        className="mt-5 flex w-full gap-1 overflow-x-auto rounded-2xl border border-[#E6EEF8] bg-white px-2 shadow-[0_1px_2px_rgba(16,33,61,0.04)]"
      >
        {viewTabs.map((item) => {
          const selected = tab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`campaign-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`campaign-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`relative inline-flex h-11 shrink-0 items-center gap-2 px-3 text-[13px] font-semibold transition-colors duration-200 ${focusClass} ${
                selected ? 'text-navy' : 'text-ink/45 hover:text-navy'
              }`}
            >
              <Icon
                size={16}
                strokeWidth={2.2}
                aria-hidden="true"
                className={`transition-colors duration-200 ${selected ? 'text-blue' : 'text-ink/35'}`}
              />
              {item.label}
              {selected ? (
                <motion.span
                  layoutId="campaign-tab-underline"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue"
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tab}
        role="tabpanel"
        id={`campaign-panel-${tab}`}
        aria-labelledby={`campaign-tab-${tab}`}
        className="mt-4"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
      {tab === 'details' ? (
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,22.5rem)]">
        <section className={card}>
          <h2 className="text-base font-bold text-navy">Campaign details</h2>
          <dl className="mt-1">
            <DetailRow icon={Users} label="Audience">
              <span className="inline-flex max-w-full truncate rounded-full bg-[#F3F6FB] px-2.5 py-1 text-xs font-medium text-ink/70">
                {audienceLabel(campaign)}
              </span>
            </DetailRow>
            <DetailRow icon={UserCheck} label="Eligible recipients">
              <span className="tabular-nums">{formatCount(campaign.eligibleRecipients ?? campaign.recipients)}</span>
            </DetailRow>
            <DetailRow icon={CircleOff} label="Not eligible">
              <span className="tabular-nums">{formatCount(campaign.notEligible ?? 0)}</span>
            </DetailRow>
            <DetailRow icon={MessageSquare} label="Estimated SMS">
              <span className="tabular-nums">{formatCount(campaign.estimatedSmsUnits ?? 0)}</span>
            </DetailRow>
            <DetailRow icon={Send} label="Sender">{campaign.sender || '—'}</DetailRow>
            {campaign.trackingUrl ? (
              <DetailRow icon={Link2} label="Tracking link">
                <a
                  href={campaign.trackingUrl}
                  className={`inline-flex items-center gap-1 font-semibold text-blue ${focusClass}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open link
                  <ExternalLink size={13} strokeWidth={2.2} aria-hidden="true" />
                </a>
              </DetailRow>
            ) : null}
            <DetailRow icon={isOccasion ? Zap : Calendar} label={isOccasion ? 'Trigger' : 'Schedule'}>
              {scheduleLabel(campaign)}
            </DetailRow>
            {isOccasion ? (
              <>
                {campaign.occasionType === 'custom' && campaign.customDate ? (
                  <DetailRow icon={Calendar} label="Date">
                    {formatCreated(`${campaign.customDate}T12:00:00`)}
                  </DetailRow>
                ) : null}
                <DetailRow icon={Clock} label="Send time">{formatSendTime(campaign.sendTime)}</DetailRow>
                <DetailRow icon={Layers} label="Offset">{offsetLabel(campaign)}</DetailRow>
                <DetailRow icon={Repeat} label="Repeat">
                  {campaign.repeatYearly ? 'Every year' : 'Does not repeat'}
                </DetailRow>
              </>
            ) : null}
            {!isOccasion && campaign.cta?.enabled ? (
              <DetailRow icon={Link2} label="CTA">
                {campaign.cta.label ? `${campaign.cta.label}: ${formatCtaValue(campaign.cta)}` : formatCtaValue(campaign.cta)}
              </DetailRow>
            ) : null}
            {campaign.updatedAt ? (
              <DetailRow icon={Calendar} label="Updated">{formatCreated(campaign.updatedAt)}</DetailRow>
            ) : null}
          </dl>

          {audience.length ? (
            <ul className="mt-4 grid gap-3 border-t border-[#EEF3FA] pt-4">
              {audience.map((group) => (
                <li key={group.id}>
                  <Link
                    to={paths.contactGroup(group.id)}
                    className={`flex items-center gap-3 rounded-2xl border border-[#E6EEF8] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(16,33,61,0.04)] hover:border-blue/30 ${focusClass}`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E7F1FC] text-blue">
                      <Users size={16} strokeWidth={2.1} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{group.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-blue tabular-nums">{formatCount(group.active)} active</span>
                    <ChevronRight size={16} strokeWidth={2.2} className="shrink-0 text-ink/30" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <aside>
          <div className="rounded-2xl border border-[#D8E7FA] bg-[linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_45%)] px-5 py-5 sm:px-6">
            <p className="text-center text-xs font-semibold tracking-wide text-ink/45 uppercase">Phone preview</p>
            <div className="mt-4 flex justify-center">
              <PhonePreview
                sender={campaign.sender}
                body={campaign.body}
                cta={isOccasion ? null : campaign.cta}
              />
            </div>
          </div>
        </aside>

        {isOccasion && Array.isArray(campaign.upcoming) ? (
          <section className={`${card} xl:col-span-2`}>
            <h2 className="text-base font-bold text-navy">Upcoming sends</h2>
            <p className="mt-1 text-sm text-ink/60">Estimated birthday and occasion messages in the next week.</p>
            <dl className="mt-4 space-y-2">
              {campaign.upcoming.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-canvas px-3 py-3">
                  <dt className="text-sm text-ink/60">{item.label}</dt>
                  <dd className="text-sm font-semibold text-navy tabular-nums">{formatCount(item.recipients)} recipients</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
      ) : (
      <CampaignInsights
        campaignId={campaign.id}
        campaignName={campaign.name}
        panel={tab}
        focus={eventFocus}
        onFocus={inspectEvents}
        onPanel={setTab}
      />
      )}

      {tab === 'details' && Array.isArray(campaign.recipientsSample) && campaign.recipientsSample.length ? (
        <section className={`${card} mt-4`}>
          <h2 className="text-base font-bold text-navy">Recipients</h2>
          <p className="mt-1 text-sm text-ink/60">Delivery status for people included in this campaign.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-medium text-ink/50">
                  {['Recipient', 'Phone', 'SMS status'].map((label) => (
                    <th key={label} scope="col" className="border-b border-ink/10 px-3 py-2 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaign.recipientsSample.map((row) => (
                  <tr key={`${row.phone}-${row.name}`}>
                    <td className="border-b border-ink/[0.06] px-3 py-3 font-medium text-navy">{row.name}</td>
                    <td className="border-b border-ink/[0.06] px-3 py-3 text-ink/70">{row.phone}</td>
                    <td className="border-b border-ink/[0.06] px-3 py-3 capitalize text-ink/70">{row.smsStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      </motion.div>
      </AnimatePresence>

    </div>
  )
}
