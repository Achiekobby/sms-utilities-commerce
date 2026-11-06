import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { usePermissions } from '../../../features/auth/usePermissions'
import { actionTone, formatWhen, labelize, metadataRows, partyLabel } from '../../../features/activity-logs/activityModel'
import { paths } from '../../../routes/paths'
import { focusClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

function Party({ title, party }) {
  const label = partyLabel(party)
  if (!label) return null
  return (
    <div className="rounded-xl bg-[#F7FAFC] px-3 py-2.5">
      <p className="text-xs font-medium text-ink/45">{title}</p>
      <p className="mt-1 text-sm font-semibold text-navy">{label}</p>
      <p className="mt-0.5 text-xs text-ink/50">
        {party?.type || 'Account'}
        {party?.id != null ? ` · ${party.id}` : ''}
      </p>
    </div>
  )
}

export function ActivityLogDrawer({ log, onClose }) {
  const access = usePermissions()
  const canOpenClient = access.hasPermission('client.manage')
  const dialogRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const details = metadataRows(log?.metadata)
  const clientParty = [log?.transmitter, log?.receiver].find((party) => party?.type === 'Client' && party?.id != null)

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
      className={`${closing ? 'drawer-right-out' : 'drawer-right'} fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(28rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">Activity</p>
          <h2 id={titleId} className="mt-1 text-lg font-bold tracking-tight text-navy">
            {log?.title || 'Activity'}
          </h2>
          <p className="mt-1 text-sm text-ink/55">{formatWhen(log?.created_at)}</p>
        </div>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close activity"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{labelize(log?.module) || 'Module'}</Badge>
          <Badge tone={actionTone(log?.action)}>{labelize(log?.action) || 'Action'}</Badge>
          <Badge tone="neutral">{labelize(log?.actor) || 'Actor'}</Badge>
        </div>
        <div className="grid gap-2">
          <Party title="By" party={log?.transmitter} />
          <Party title="Affects" party={log?.receiver} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-navy">Details</h3>
          {details.length ? (
            <dl className="mt-2">
              {details.map((row) => (
                <div key={row.key} className="flex items-baseline justify-between gap-4 border-b border-ink/[0.06] py-2.5 last:border-b-0">
                  <dt className="text-sm text-ink/55">{row.label}</dt>
                  <dd className="text-right text-sm font-medium break-all text-navy">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-sm text-ink/55">No extra details were recorded.</p>
          )}
        </div>
      </div>

      {canOpenClient && clientParty ? (
        <footer className="border-t border-ink/[0.06] px-5 py-4">
          <Link
            to={`${paths.clients}/${clientParty.id}`}
            className={`inline-flex h-11 w-full items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white hover:bg-[#0a3268] ${focusClass}`}
          >
            Open client
          </Link>
        </footer>
      ) : null}
    </dialog>
  )
}
