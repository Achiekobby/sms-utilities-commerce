import { BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { labelize } from '../../../features/clients/clientModel'
import { isMissingSubscription } from '../../../features/subscriptions/subscriptionModel'
import { paths } from '../../../routes/paths'
import { useGetClientSubscriptionQuery } from '../../../services/api/subscriptions/subscriptionsApi'
import { SubscriptionArchives } from '../subscriptions/SubscriptionArchives'
import { SubscriptionFacts } from '../subscriptions/SubscriptionFacts'
import { TopUpDrawer } from '../subscriptions/TopUpDrawer'
import { cardClass, focusClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function ClientSubscription({ clientId, clientName }) {
  const access = usePermissions()
  const canAssign = access.hasPermission('subscription.assign')
  const [topUp, setTopUp] = useState(false)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetClientSubscriptionQuery(clientId, { skip: !clientId })
  const subscription = data?.data && typeof data.data === 'object' && !Array.isArray(data.data) && data.data.id ? data.data : null
  const missing = isError && isMissingSubscription(error)
  const waiting = !subscription && (isLoading || isFetching) && !isError

  return (
    <>
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F8F0] text-green">
              <BadgeCheck size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-navy">Subscription</h2>
              <p className="mt-0.5 text-sm text-ink/55">
                {subscription ? 'The plan currently attached to this client.' : 'No plan is attached yet.'}
              </p>
            </div>
          </div>
          {subscription ? (
            <Badge tone={subscription.status === 'active' ? 'good' : subscription.status === 'expired' ? 'bad' : 'neutral'}>
              {labelize(subscription.status) || 'Unknown'}
            </Badge>
          ) : null}
        </div>

        {waiting ? <div className="skeleton mt-4 h-28 rounded-xl" aria-hidden="true" /> : null}

        {isError && !missing ? (
          <div className="mt-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button type="button" onClick={refetch} className={`mt-2 text-sm font-semibold text-blue ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}

        {subscription ? (
          <div className="mt-2">
            <SubscriptionFacts subscription={subscription} />
          </div>
        ) : null}

        {!waiting && (subscription || missing || (!isError && !subscription)) ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {canAssign ? (
              <button
                type="button"
                onClick={() => setTopUp(true)}
                className={`inline-flex h-10 cursor-pointer items-center rounded-xl bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
              >
                Top up credit
              </button>
            ) : null}
            <Link
              to={`${paths.subscriptions}?client_id=${clientId}`}
              className={`inline-flex h-10 items-center rounded-xl border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-green/40 ${focusClass}`}
            >
              All subscriptions
            </Link>
          </div>
        ) : null}
      </section>

      <section className={`${cardClass} lg:col-span-2`}>
        <h2 className="text-lg font-bold tracking-tight text-navy">Subscription history</h2>
        <p className="mt-0.5 text-sm text-ink/55">Earlier plans recorded for this client.</p>
        <SubscriptionArchives clientId={clientId} />
      </section>

      {topUp ? <TopUpDrawer clientId={clientId} clientName={clientName} onClose={() => setTopUp(false)} /> : null}
    </>
  )
}
