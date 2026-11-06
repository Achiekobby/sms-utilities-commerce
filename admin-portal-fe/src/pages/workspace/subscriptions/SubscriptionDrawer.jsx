import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { usePermissions } from '../../../features/auth/usePermissions'
import { clientName } from '../../../features/clients/clientModel'
import { labelize } from '../../../features/subscriptions/subscriptionModel'
import { paths } from '../../../routes/paths'
import { ClientAvatar } from '../clients/ClientAvatar'
import { SubscriptionArchives } from './SubscriptionArchives'
import { SubscriptionFacts } from './SubscriptionFacts'
import { focusClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

function statusTone(status) {
  if (status === 'active') return 'good'
  if (status === 'expired') return 'bad'
  return 'neutral'
}

export function SubscriptionDrawer({ subscription, onClose, onTopUp }) {
  const access = usePermissions()
  const canOpenClient = access.hasPermission('client.manage')
  const dialogRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const client = subscription?.client
  const name = client ? clientName(client) : `Client ${subscription?.client_id ?? ''}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!closing) return undefined
    const timer = window.setTimeout(() => onCloseRef.current(), 240)
    return () => window.clearTimeout(timer)
  }, [closing])

  function requestClose() {
    if (closing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    setClosing(true)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      className={`${closing ? 'drawer-right-out' : 'drawer-right'} fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(32rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Subscription</p>
          <h2 id={titleId} className="mt-1 truncate text-lg font-bold tracking-tight text-navy">
            {subscription?.plan_name || 'Subscription'}
          </h2>
          <div className="mt-2">
            <Badge tone={statusTone(subscription?.status)}>{labelize(subscription?.status) || 'Unknown'}</Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close subscription"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-[#F7FAFC] px-3 py-2.5">
          <ClientAvatar client={client} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy">{name}</p>
            <p className="truncate text-xs text-ink/50">{client?.email || `Client ${subscription?.client_id}`}</p>
          </div>
        </div>
        <SubscriptionFacts subscription={subscription} />
        <div>
          <h3 className="text-sm font-semibold text-navy">Earlier subscriptions</h3>
          <SubscriptionArchives clientId={subscription?.client_id} compact />
        </div>
      </div>

      <footer className="flex flex-col gap-2 border-t border-ink/[0.06] px-5 py-4">
        {onTopUp ? (
          <button
            type="button"
            onClick={onTopUp}
            className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
          >
            Top up credit
          </button>
        ) : null}
        {canOpenClient && subscription?.client_id ? (
          <Link
            to={`${paths.clients}/${subscription.client_id}`}
            className={`inline-flex h-11 items-center justify-center rounded-xl border border-ink/10 text-sm font-semibold text-navy hover:border-green/40 ${focusClass}`}
          >
            Open client
          </Link>
        ) : null}
      </footer>
    </dialog>
  )
}
