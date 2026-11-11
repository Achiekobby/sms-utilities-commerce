import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Activity, ArrowRight, Box, CalendarDays, Check, Coins, Layers, Star, Tag } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatTopUpDay, formatWalletAmount, statusLabel } from '../../../features/wallet/walletRecord'
import { paths } from '../../../routes/paths'
import { useGetClientPlansQuery } from '../../../services/api/plans/plansApi'
import {
  useGetClientSubscriptionArchivesQuery,
  useGetClientSubscriptionQuery,
} from '../../../services/api/subscriptions/subscriptionsApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { PageBar } from '../contacts/sections/PageBar'
import { formatCount } from '../dashboard/format'
import {
  billingPeriodsFromPlans,
  durationLabel,
  isNonExpiryPeriod,
  mapClientPlans,
  maxSavingsPercent,
  planPerks,
  planPrice,
  planStandout,
} from '../../guest/pricingModel'

const ease = [0.22, 1, 0.36, 1]
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'
const head =
  'border-b border-[#E1EAF6] bg-[#F3F7FD] px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase first:pl-4 last:pr-4'
const cell = 'border-b border-[#E7EEF8] px-3 py-3 align-middle text-sm text-ink/75 first:pl-4 last:pr-4'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: 0.05 + i * 0.06 } }),
}

function formatMoney(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '—'
  return `GH₵${formatCount(value)}`
}

function packageLabel(row) {
  if (!row) return '—'
  if (row.nonExpiry || row.type === 'non_expiry' || row.type === 'non-expiry') return 'Non-expiry'
  if (row.type === 'trial') return row.months != null ? `Trial · ${durationLabel(row.months)}` : 'Trial'
  if (row.months != null) return durationLabel(row.months)
  return row.type ? statusLabel(row.type) : '—'
}

function StatusBadge({ status }) {
  const key = String(status ?? '').toLowerCase()
  const active = key === 'active' || key === 'completed' || key === 'success' || key === 'assigned' || key === 'paid'
  const pending = key === 'pending' || key === 'processing'
  const tone = active
    ? 'bg-[#E5F6EC] text-green'
    : pending
      ? 'bg-[#FFF4DF] text-[#B45F06]'
      : 'bg-[#F3F6FB] text-navy'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>
      {statusLabel(status)}
    </span>
  )
}

function MetricIcon({ icon: Icon }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FF] text-blue">
      <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
    </span>
  )
}

function MetricField({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <MetricIcon icon={icon} />
      <div className="min-w-0">
        <dt className="text-[12px] leading-4 text-ink/50">{label}</dt>
        <dd className="mt-1 text-[15px] leading-5 font-bold text-navy sm:text-base">{children}</dd>
      </div>
    </div>
  )
}

function CurrentSubscriptionCard({ loading, missing, error, subscription, onRetry }) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.06),0_16px_36px_-20px_rgba(11,31,91,0.45)]">
      <header className="flex items-center gap-3 bg-gradient-to-r from-navy via-[#0B2A6B] to-[#1A4FA8] px-4 py-3.5 sm:px-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/20">
          <Layers size={16} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span className="hidden h-5 w-px bg-white/25 sm:block" aria-hidden="true" />
        <h2 className="text-[15px] font-bold tracking-tight text-white sm:text-base">Current subscription</h2>
      </header>

      <div className="px-4 py-5 sm:px-5 sm:py-6">
        {loading ? <span className="skeleton block h-28 w-full rounded-xl" /> : null}

        {!loading && missing ? (
          <p className="text-sm leading-6 text-ink/60">
            No active subscription yet. Pick a package below to get started.
          </p>
        ) : null}

        {!loading && error ? (
          <div>
            <p className="text-sm text-[#9F1C26]">{error}</p>
            <button type="button" onClick={onRetry} className={`mt-2 text-sm font-semibold text-blue ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !missing && !error && subscription ? (
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
            <div className="space-y-5 lg:border-r lg:border-[#E4EEF9] lg:pr-6">
              <MetricField icon={Tag} label="Plan">
                {subscription.planName || '—'}
              </MetricField>
              <MetricField icon={Layers} label="Units">
                <span className="tabular-nums">
                  {subscription.units != null ? formatCount(subscription.units) : '—'}
                </span>
              </MetricField>
              <MetricField icon={CalendarDays} label="Ends">
                {subscription.endsAt ? formatTopUpDay(subscription.endsAt) : 'No expiry'}
              </MetricField>
            </div>

            <div className="space-y-5 lg:border-r lg:border-[#E4EEF9] lg:px-6">
              <MetricField icon={Activity} label="Status">
                {subscription.status ? <StatusBadge status={subscription.status} /> : '—'}
              </MetricField>
              <MetricField icon={Box} label="Package">
                {packageLabel(subscription)}
              </MetricField>
            </div>

            <div className="space-y-5 sm:col-span-2 lg:col-span-1 lg:pl-6">
              <MetricField icon={Coins} label="Price">
                <span className="tabular-nums">
                  {subscription.price != null ? formatMoney(subscription.price) : '—'}
                </span>
              </MetricField>
              <MetricField icon={CalendarDays} label="Started">
                {subscription.startsAt ? formatTopUpDay(subscription.startsAt) : '—'}
              </MetricField>
            </div>
          </dl>
        ) : null}
      </div>
    </section>
  )
}

function BillingToggle({ periods, value, onChange, savings }) {
  const group = useId()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="radiogroup"
        aria-label="Billing period"
        className="relative flex max-w-full flex-wrap gap-1 rounded-xl bg-[#F3F6FB] p-1"
      >
        {periods.map((option) => {
          const active = option === value
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={`relative min-w-[5.5rem] rounded-lg px-3 py-2 text-sm font-semibold ${focusClass}`}
            >
              {active ? (
                <motion.span
                  layoutId={`${group}-pill`}
                  className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(16,33,61,0.1)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className={`relative ${active ? 'text-navy' : 'text-ink/55'}`}>{durationLabel(option)}</span>
            </button>
          )
        })}
      </div>
      {savings > 0 ? (
        <span className="rounded-md bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">
          Save up to {savings}% vs monthly
        </span>
      ) : isNonExpiryPeriod(value) ? (
        <span className="rounded-md bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue">Units never expire</span>
      ) : null}
    </div>
  )
}

function PlanCard({ plan, index, period, onCheckout }) {
  const selected = planPrice(plan, period)
  const perks = planPerks(plan, period).slice(0, 4)
  const standout = planStandout(plan, period)
  const dark = Boolean(plan.featured)

  return (
    <motion.article
      variants={cardVariants}
      custom={index}
      className={`relative flex flex-col rounded-2xl p-4 sm:p-5 ${
        dark
          ? 'bg-navy text-white shadow-[0_24px_48px_-20px_rgba(11,31,91,0.55)]'
          : 'bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.04),0_14px_28px_-14px_rgba(16,33,61,0.18)] ring-1 ring-ink/8'
      }`}
    >
      {dark ? (
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-green px-2.5 py-0.5 text-[11px] font-semibold text-white">
          <Star size={11} fill="currentColor" aria-hidden="true" />
          Most popular
        </span>
      ) : null}

      <h2 className={`text-base font-bold sm:text-lg ${dark ? 'text-white' : 'text-navy'}`}>{plan.name}</h2>
      <p className={`mt-1 min-h-8 text-[13px] leading-4 ${dark ? 'text-white/70' : 'text-ink/60'}`}>{plan.audience}</p>

      <div className={`mt-4 ${dark ? 'text-white' : 'text-navy'}`}>
        <p className="flex items-baseline gap-1">
          <span className="text-sm font-semibold opacity-70">GH₵</span>
          <span className="relative inline-flex h-9 overflow-hidden text-3xl leading-9 font-bold tracking-tight">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${selected.price}-${period}`}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.25, ease }}
              >
                {formatCount(selected.price)}
              </motion.span>
            </AnimatePresence>
          </span>
        </p>
        <p className={`mt-1 text-[12px] leading-4 ${dark ? 'text-white/65' : 'text-ink/55'}`}>
          {selected.nonExpiry
            ? 'One-time · never expires'
            : selected.months === 1
              ? 'Billed monthly'
              : `${durationLabel(period)} package`}
        </p>
      </div>

      <p className={`mt-2 text-[11px] font-medium ${dark ? 'text-white/60' : 'text-ink/50'}`}>
        {formatCount(selected.units)} SMS units
        {selected.nonExpiry ? ' · no expiry' : ''}
      </p>

      <button
        type="button"
        disabled={selected.price <= 0}
        onClick={() => onCheckout(plan)}
        className={`mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusClass} ${
          dark ? 'bg-white text-navy hover:bg-white/90' : 'bg-green text-white hover:bg-[#006B46]'
        }`}
      >
        Subscribe
        <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
      </button>

      <ul className="mt-4 space-y-2">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-[13px] leading-4">
            <span
              className={`mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full ${
                dark ? 'bg-white text-navy' : 'bg-green text-white'
              }`}
            >
              <Check size={9} strokeWidth={3.5} aria-hidden="true" />
            </span>
            <span className={dark ? 'text-white/90' : 'text-ink/75'}>{perk}</span>
          </li>
        ))}
      </ul>

      <div className={`mt-auto rounded-xl p-3 ${dark ? 'bg-white/10' : 'bg-[#F7FAFD]'}`}>
        <p className={`text-[10px] font-semibold tracking-wide uppercase ${dark ? 'text-white/60' : 'text-ink/45'}`}>
          Standout
        </p>
        <p className={`mt-1 text-[13px] font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{standout.title}</p>
        <p className={`mt-1 text-[12px] leading-4 ${dark ? 'text-white/70' : 'text-ink/60'}`}>{standout.text}</p>
      </div>
    </motion.article>
  )
}

export function PricingPage() {
  useDocumentTitle('Plans')
  const navigate = useNavigate()
  const plansQuery = useGetClientPlansQuery()
  const subscriptionQuery = useGetClientSubscriptionQuery()
  const [archivePage, setArchivePage] = useState(1)
  const archivesQuery = useGetClientSubscriptionArchivesQuery({ page: archivePage })

  const plans = useMemo(() => mapClientPlans(plansQuery.data?.data), [plansQuery.data?.data])
  const billingPeriods = useMemo(() => billingPeriodsFromPlans(plans), [plans])
  const [period, setPeriod] = useState(1)
  const selectedPeriod = billingPeriods.includes(period) ? period : (billingPeriods[0] ?? 1)
  const savings = maxSavingsPercent(plans, selectedPeriod)

  const subscription = subscriptionQuery.data
  const missingSubscription =
    subscriptionQuery.isError &&
    (String(subscriptionQuery.error?.status) === '404' ||
      String(subscriptionQuery.error?.data?.status_code) === '404')

  const archiveRows = archivesQuery.data?.rows ?? []
  const archiveLastPage = archivesQuery.data?.lastPage ?? 1
  if (archiveLastPage && archivePage > archiveLastPage) setArchivePage(archiveLastPage)

  function onCheckout(plan) {
    navigate(paths.planCheckoutFor(plan.id, selectedPeriod))
  }

  const waitingPlans = plansQuery.isLoading || (plansQuery.isFetching && !plans.length)

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Plans</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            Choose an SMS package, review it on checkout, then pay securely. Subscriptions are billed separately from
            your wallet.
          </p>
        </header>

        <CurrentSubscriptionCard
          loading={subscriptionQuery.isLoading}
          missing={missingSubscription || (!subscriptionQuery.isError && !subscription)}
          error={
            !missingSubscription && subscriptionQuery.isError
              ? apiErrorMessage(subscriptionQuery.error)
              : ''
          }
          subscription={subscription}
          onRetry={() => subscriptionQuery.refetch()}
        />

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">Choose a package</h2>
              <p className="mt-1 text-sm text-ink/55">
                Prices update with the billing period you select. Continue to checkout to review and pay.
              </p>
            </div>
          </div>

          {plans.length ? (
            <BillingToggle
              periods={billingPeriods}
              value={selectedPeriod}
              onChange={setPeriod}
              savings={savings}
            />
          ) : null}

          {waitingPlans ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-[26rem] rounded-2xl" aria-hidden="true" />
              ))}
            </div>
          ) : null}

          {plansQuery.isError && !plans.length ? (
            <div className={`${card} mt-6`}>
              <p className="text-sm font-semibold text-navy">Plans could not be loaded</p>
              <p className="mt-1 text-sm text-ink/60">{apiErrorMessage(plansQuery.error)}</p>
              <button
                type="button"
                onClick={() => plansQuery.refetch()}
                className={`mt-4 inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-semibold text-white ${focusClass}`}
              >
                Try again
              </button>
            </div>
          ) : null}

          {!waitingPlans && !plansQuery.isError && !plans.length ? (
            <div className={`${card} mt-6`}>
              <p className="text-sm font-semibold text-navy">No plans available</p>
              <p className="mt-1 text-sm text-ink/60">Active packages will appear here once they are published.</p>
            </div>
          ) : null}

          {plans.length ? (
            <motion.div
              className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch"
              initial="hidden"
              animate="show"
            >
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  period={selectedPeriod}
                  onCheckout={onCheckout}
                />
              ))}
            </motion.div>
          ) : null}
        </section>

        <section aria-labelledby="subscription-history-heading" className="mt-10">
          <h2 id="subscription-history-heading" className="text-[15px] font-semibold text-navy">
            Subscription history
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-ink/60">Previous plans and assignments on this account.</p>

          {archivesQuery.isLoading ? (
            <div role="status" className="mt-4 space-y-2">
              <span className="sr-only">Loading subscription history</span>
              {Array.from({ length: 3 }, (_, index) => (
                <span key={index} className="skeleton block h-11 rounded-lg" />
              ))}
            </div>
          ) : null}

          {archivesQuery.isError ? (
            <div
              role="alert"
              className="mt-4 flex flex-col gap-3 rounded-lg border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-[#9F1C26]">{apiErrorMessage(archivesQuery.error)}</p>
              <button
                type="button"
                onClick={() => archivesQuery.refetch()}
                className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
              >
                Try again
              </button>
            </div>
          ) : null}

          {!archivesQuery.isLoading && !archivesQuery.isError && archiveRows.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-ink/15 px-4 py-10 text-center">
              <p className="text-sm font-semibold text-navy">No subscription history yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
                Past subscriptions and trial assignments will appear here after your first purchase.
              </p>
            </div>
          ) : null}

          {archiveRows.length ? (
            <>
              <div className="mt-4 hidden overflow-x-auto rounded-lg border border-ink/10 md:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className={head}>Plan</th>
                      <th className={`${head} text-right`}>Price</th>
                      <th className={head}>Package</th>
                      <th className={head}>Units</th>
                      <th className={head}>Started</th>
                      <th className={head}>Ends</th>
                      <th className={head}>Payment</th>
                      <th className={head}>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archiveRows.map((row) => (
                      <tr key={row.id}>
                        <td className={`${cell} font-semibold text-navy`}>{row.planName || '—'}</td>
                        <td className={`${cell} text-right font-semibold whitespace-nowrap text-navy tabular-nums`}>
                          {row.price != null ? formatWalletAmount(row.price, 'GHS') : '—'}
                        </td>
                        <td className={cell}>{packageLabel(row)}</td>
                        <td className={`${cell} tabular-nums`}>
                          {row.units != null ? formatCount(row.units) : '—'}
                        </td>
                        <td className={`${cell} whitespace-nowrap`}>
                          {row.startsAt ? formatTopUpDay(row.startsAt) : '—'}
                        </td>
                        <td className={`${cell} whitespace-nowrap`}>
                          {row.endsAt ? formatTopUpDay(row.endsAt) : 'No expiry'}
                        </td>
                        <td className={cell}>
                          {row.paymentStatus ? <StatusBadge status={row.paymentStatus} /> : '—'}
                        </td>
                        <td className={`${cell} font-mono text-xs`}>{row.paymentReference || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-lg border border-ink/10 md:hidden">
                {archiveRows.map((row) => (
                  <li key={row.id} className="space-y-1 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-navy">{row.planName || 'Subscription'}</p>
                      {row.paymentStatus ? <StatusBadge status={row.paymentStatus} /> : null}
                    </div>
                    <p className="text-sm font-semibold text-navy tabular-nums">
                      {row.price != null ? formatWalletAmount(row.price, 'GHS') : '—'}
                      {row.units != null ? ` · ${formatCount(row.units)} units` : ''}
                    </p>
                    <p className="text-xs text-ink/55">
                      {[
                        packageLabel(row),
                        row.startsAt ? formatTopUpDay(row.startsAt) : null,
                        row.paymentReference,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>

              <PageBar
                page={archivesQuery.data?.page ?? archivePage}
                lastPage={archiveLastPage}
                total={archivesQuery.data?.total ?? 0}
                perPage={archivesQuery.data?.perPage ?? 15}
                onPage={setArchivePage}
                label="Subscription history pages"
              />
            </>
          ) : null}
        </section>
      </div>
    </MotionConfig>
  )
}
