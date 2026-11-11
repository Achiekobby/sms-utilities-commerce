import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react'
import { useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import { paths } from '../../../routes/paths'
import { useGetClientPlansQuery } from '../../../services/api/plans/plansApi'
import {
  subscribeBody,
  useGetClientSubscriptionQuery,
  useSubscribeToPlanMutation,
} from '../../../services/api/subscriptions/subscriptionsApi'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import {
  durationLabel,
  isNonExpiryPeriod,
  mapClientPlans,
  planPerks,
  planPrice,
} from '../../guest/pricingModel'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'

function formatMoney(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '—'
  return `GH₵${formatCount(value)}`
}

function parseCheckoutParams(searchParams) {
  const planId = String(searchParams.get('plan') ?? '').trim()
  const monthsRaw = searchParams.get('months')
  const months = monthsRaw == null || monthsRaw === '' ? NaN : Number(monthsRaw)
  return {
    planId,
    months: Number.isFinite(months) ? months : null,
  }
}

export function PlanCheckoutPage() {
  useDocumentTitle('Checkout')
  const notify = useNotify()
  const [searchParams] = useSearchParams()
  const { planId, months } = parseCheckoutParams(searchParams)

  const plansQuery = useGetClientPlansQuery()
  const subscriptionQuery = useGetClientSubscriptionQuery()
  const [subscribe, subscribeState] = useSubscribeToPlanMutation()

  const plans = useMemo(() => mapClientPlans(plansQuery.data?.data), [plansQuery.data?.data])
  const plan = useMemo(() => plans.find((row) => String(row.id) === String(planId)) ?? null, [plans, planId])
  const selected = plan && months != null ? planPrice(plan, months) : null
  const perks = plan && months != null ? planPerks(plan, months).slice(0, 5) : []
  const current = subscriptionQuery.data

  const waiting = plansQuery.isLoading || (plansQuery.isFetching && !plans.length)
  const invalidSelection = !waiting && (!planId || months == null || !plan || !selected || selected.price <= 0)

  async function payNow() {
    if (!plan || !selected || subscribeState.isLoading) return

    try {
      const result = await subscribe(
        subscribeBody({
          planId: plan.id,
          months,
          nonExpiry: selected.nonExpiry || isNonExpiryPeriod(months),
        }),
      ).unwrap()

      const checkoutUrl = result.checkout?.nextUrl || result.checkout?.paymentLink
      if (checkoutUrl) {
        notify.success(result.message || 'Redirecting to payment…')
        window.location.assign(checkoutUrl)
        return
      }

      notify.error('Checkout link was not returned. Try again or contact support.')
    } catch (failure) {
      notify.error(apiErrorMessage(failure) || 'Payment could not be started.')
    }
  }

  if (invalidSelection) {
    return <Navigate to={paths.plans} replace />
  }

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Checkout</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            Review your package, then complete payment to activate your SMS units.
          </p>
        </div>
        <Link
          to={paths.plans}
          className={`inline-flex h-10 shrink-0 items-center gap-2 self-end rounded-xl border border-[#D8E7FA] bg-white px-3.5 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(20,115,230,0.06)] transition-colors hover:border-blue/30 hover:bg-[#F7FAFD] sm:self-start ${focusClass}`}
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-[#E8F1FF] text-blue">
            <ArrowLeft size={14} strokeWidth={2.4} aria-hidden="true" />
          </span>
          Back to plans
        </Link>
      </header>

      {waiting ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
          <span className="skeleton h-72 rounded-xl" />
          <span className="skeleton h-72 rounded-xl" />
        </div>
      ) : null}

      {plansQuery.isError && !plan ? (
        <div className={`${card} mt-6`} role="alert">
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

      {plan && selected ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] lg:items-start">
          <section className={card}>
            <p className="text-[11px] font-semibold tracking-wide text-ink/45 uppercase">Order summary</p>
            <h2 className="mt-2 text-xl font-bold text-navy">{plan.name}</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">{plan.audience}</p>

            <dl className="mt-5 space-y-3 border-t border-ink/8 pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink/55">Package</dt>
                <dd className="font-semibold text-navy">{durationLabel(months)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/55">SMS units</dt>
                <dd className="font-semibold text-navy tabular-nums">
                  {formatCount(selected.units)}
                  {selected.nonExpiry ? ' · no expiry' : ''}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/55">Billing</dt>
                <dd className="font-semibold text-navy">
                  {selected.nonExpiry
                    ? 'One-time purchase'
                    : selected.months === 1
                      ? 'Monthly package'
                      : `${durationLabel(months)} package`}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-ink/8 pt-3">
                <dt className="font-semibold text-navy">Total due</dt>
                <dd className="text-lg font-bold text-navy tabular-nums">{formatMoney(selected.price)}</dd>
              </div>
            </dl>

            {perks.length ? (
              <ul className="mt-5 space-y-2 border-t border-ink/8 pt-4">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-[13px] leading-5 text-ink/75">
                    <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-green text-white">
                      <Check size={9} strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            ) : null}

            {current?.planName ? (
              <p className="mt-5 rounded-lg bg-[#F7FAFD] px-3 py-2.5 text-[13px] leading-5 text-ink/65">
                Current plan: <span className="font-semibold text-navy">{current.planName}</span>
                {current.status ? ` · ${current.status}` : ''}. Purchasing a new package will replace or extend based on
                billing rules after payment succeeds.
              </p>
            ) : null}
          </section>

          <section className={card}>
            <h2 className="text-sm font-bold text-navy">Payment</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              You will complete MoMo or card payment on Paystack. Units are credited after the charge succeeds.
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#EAF3FF] px-3 py-2.5 text-[13px] leading-5 text-navy">
              <Shield size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-blue" aria-hidden="true" />
              <span>Your payment is processed securely. Units are credited after it succeeds.</span>
            </div>

            <div className="mt-5 rounded-lg border border-ink/10 bg-[#F7FAFD] px-3.5 py-3">
              <p className="text-[12px] text-ink/55">Amount to pay</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-navy tabular-nums">
                {formatMoney(selected.price)}
              </p>
            </div>

            <button
              type="button"
              disabled={subscribeState.isLoading}
              onClick={payNow}
              className={`mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
            >
              {subscribeState.isLoading ? 'Opening payment…' : 'Pay'}
              {!subscribeState.isLoading ? <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" /> : null}
            </button>

            <Link
              to={paths.plans}
              className={`mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl border border-ink/15 bg-white text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
            >
              Choose a different plan
            </Link>
          </section>
        </div>
      ) : null}
    </div>
  )
}
