import { Landmark, Star } from 'lucide-react'
import { useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { useNotify } from '../../../features/notifications/useNotify'
import { formatWhen, labelize, sortedGateways } from '../../../features/payment-gateways/gatewayModel'
import { useGetPaymentGatewaysQuery, useSetPrimaryPaymentGatewayMutation } from '../../../services/api/payment-gateways/paymentGatewaysApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { ConfirmDialog } from '../profile/settings/ConfirmDialog'
import { GatewayEditDrawer } from './GatewayEditDrawer'
import { cardClass, focusClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    featured: 'bg-[#FFF4DF] text-[#9A5B00]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>
}

export function PaymentGatewaysPage() {
  const access = usePermissions()
  const allowed = access.hasPermission('payment_gateway.manage')
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPaymentGatewaysQuery(undefined, { skip: !allowed })
  const [setPrimary, { isLoading: settingPrimary }] = useSetPrimaryPaymentGatewayMutation()
  const [editing, setEditing] = useState(null)
  const [primaryTarget, setPrimaryTarget] = useState(null)
  const [primaryError, setPrimaryError] = useState('')
  const notify = useNotify()

  if (!allowed) return <AccessDeniedPage />

  const gateways = sortedGateways(Array.isArray(data?.data) ? data.data : [])
  const waiting = isLoading && !data

  async function confirmPrimary() {
    if (!primaryTarget) return
    try {
      const result = await setPrimary(primaryTarget.code).unwrap()
      setPrimaryTarget(null)
      setPrimaryError('')
      notify.success(result?.message && result.message !== 'Payment gateways loaded.' ? result.message : 'Primary payment gateway updated.')
    } catch (failure) {
      const message = apiErrorMessage(failure)
      setPrimaryError(message)
      notify.error(message)
    }
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)] sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F6FB] text-navy ring-1 ring-navy/10">
            <Landmark size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">Billing</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Payment gateways</h1>
              <span aria-live="polite" className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums">
                {waiting ? '…' : gateways.length}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">Which providers can take payments, and which one is tried first.</p>
          </div>
        </div>
      </header>

      <section className="mt-5" aria-busy={isFetching || undefined}>
        {isError && !gateways.length ? (
          <div className="rounded-2xl border border-[#E0232E]/20 bg-[#FDECEE] px-5 py-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {waiting ? (
          <ul className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
            {Array.from({ length: 2 }, (_, index) => (
              <li key={index} className="skeleton h-56 rounded-2xl" />
            ))}
          </ul>
        ) : null}

        {!waiting && !isError && !gateways.length ? (
          <div className={`${cardClass} py-10 text-center`}>
            <p className="text-sm font-semibold text-navy">No payment gateways yet</p>
            <p className="mt-1 text-sm text-ink/55">Providers will show up here once they are connected.</p>
          </div>
        ) : null}

        {gateways.length ? (
          <ul className="grid gap-4 lg:grid-cols-2">
            {gateways.map((gateway) => (
              <li key={gateway.code}>
                <article
                  className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)] ${
                    gateway.is_primary ? 'border-[#E7C27A] ring-1 ring-[#E7C27A]/70' : 'border-ink/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold tracking-tight text-navy">{gateway.name}</h2>
                      <p className="mt-0.5 text-xs font-medium tracking-wide text-ink/40 uppercase">{gateway.code}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-navy tabular-nums">Priority {gateway.priority}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {gateway.is_primary ? (
                      <Badge tone="featured">
                        <Star size={11} strokeWidth={2.2} aria-hidden="true" className="mr-1" />
                        Primary
                      </Badge>
                    ) : null}
                    <Badge tone={gateway.is_enabled ? 'good' : 'neutral'}>{gateway.is_enabled ? 'Enabled' : 'Disabled'}</Badge>
                    <Badge tone={gateway.health === 'up' ? 'good' : gateway.health === 'down' ? 'bad' : 'wait'}>
                      {labelize(gateway.health) || 'Unknown'}
                    </Badge>
                    <Badge tone={gateway.configured ? 'good' : 'wait'}>{gateway.configured ? 'Configured' : 'Not configured'}</Badge>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {(Array.isArray(gateway.methods) ? gateway.methods : []).map((method) => (
                      <li key={method} className="rounded-lg bg-[#F7FAFC] px-2.5 py-1 text-xs font-semibold text-navy">
                        {labelize(method)}
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-ink/55">Last success</dt>
                      <dd className="text-right font-medium text-navy">{formatWhen(gateway.last_success_at) || 'None yet'}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-ink/55">Failures in a row</dt>
                      <dd className="font-medium text-navy tabular-nums">{gateway.consecutive_failures ?? 0}</dd>
                    </div>
                    {gateway.last_failure_at ? (
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-ink/55">Last failure</dt>
                        <dd className="text-right font-medium text-navy">{formatWhen(gateway.last_failure_at)}</dd>
                      </div>
                    ) : null}
                    {gateway.last_failure_reason ? <p className="text-sm text-[#9F1C26]">{gateway.last_failure_reason}</p> : null}
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(gateway)}
                      className={`inline-flex h-10 cursor-pointer items-center rounded-xl bg-navy px-3 text-sm font-semibold text-white hover:bg-[#0a3268] ${focusClass}`}
                    >
                      Edit gateway
                    </button>
                    {gateway.is_primary ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryError('')
                          setPrimaryTarget(gateway)
                        }}
                        className={`inline-flex h-10 cursor-pointer items-center rounded-xl border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-green/40 ${focusClass}`}
                      >
                        Make primary
                      </button>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {editing ? <GatewayEditDrawer gateway={editing} onClose={() => setEditing(null)} /> : null}
      {primaryTarget ? (
        <ConfirmDialog
          title={`Make ${primaryTarget.name} primary?`}
          description="New payments will try this gateway first. The current primary gateway moves behind it."
          confirmLabel="Make primary"
          tone="caution"
          error={primaryError}
          busy={settingPrimary}
          onConfirm={confirmPrimary}
          onClose={() => {
            if (settingPrimary) return
            setPrimaryTarget(null)
            setPrimaryError('')
          }}
        />
      ) : null}
    </div>
  )
}
