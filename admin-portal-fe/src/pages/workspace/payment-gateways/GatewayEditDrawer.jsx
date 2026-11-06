import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { apiErrorMessage, fieldErrors } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import { gatewayBody, gatewayDirty, validateGateway } from '../../../features/payment-gateways/gatewayModel'
import { useUpdatePaymentGatewayMutation } from '../../../services/api/payment-gateways/paymentGatewaysApi'
import { focusClass } from './ui'

export function GatewayEditDrawer({ gateway, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const priorityId = useId()
  const [closing, setClosing] = useState(false)
  const [enabled, setEnabled] = useState(Boolean(gateway?.is_enabled))
  const [priority, setPriority] = useState(gateway?.priority == null ? '' : String(gateway.priority))
  const [problems, setProblems] = useState({})
  const [updateGateway, { isLoading: saving }] = useUpdatePaymentGatewayMutation()
  const notify = useNotify()
  const values = { enabled, priority }
  const dirty = gatewayDirty(gateway, values)

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

  function requestClose(force = false) {
    if (closing || (force !== true && saving)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    setClosing(true)
  }

  async function onSubmit(event) {
    event.preventDefault()
    const found = validateGateway(values)
    setProblems(found)
    if (Object.keys(found).length) {
      document.getElementById(priorityId)?.focus()
      return
    }

    try {
      const result = await updateGateway({ code: gateway.code, body: gatewayBody(gateway.code, values) }).unwrap()
      notify.success(result?.message || 'Payment gateway updated.')
      requestClose(true)
    } catch (failure) {
      const fields = fieldErrors(failure)
      setProblems({
        priority: fields.priority,
        enabled: fields.is_enabled,
        form: fields.code,
      })
      notify.error(apiErrorMessage(failure))
    }
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
      className={`${closing ? 'drawer-right-out' : 'drawer-right'} fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(24rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">Gateway</p>
          <h2 id={titleId} className="mt-1 truncate text-lg font-bold tracking-tight text-navy">
            {gateway?.name || 'Payment gateway'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => requestClose()}
          disabled={saving}
          aria-label="Close gateway"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
          <label
            onMouseDown={(event) => event.preventDefault()}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-3 text-sm font-medium text-navy has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue"
          >
            Enabled for payments
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="size-4 accent-green outline-none"
            />
          </label>
          {problems.enabled ? <p className="text-xs text-[#9F1C26]">{problems.enabled}</p> : null}

          <div>
            <label htmlFor={priorityId} className="text-sm font-semibold text-navy">
              Priority
            </label>
            <p className="mt-1 text-sm text-ink/55">Lower numbers are tried first. The primary gateway stays at the front.</p>
            <input
              id={priorityId}
              inputMode="numeric"
              value={priority}
              aria-invalid={problems.priority ? true : undefined}
              onChange={(event) => {
                setPriority(event.target.value)
                setProblems((current) => ({ ...current, priority: undefined }))
              }}
              className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-green ${focusClass} ${
                problems.priority ? 'border-[#E0232E]' : 'border-ink/10'
              }`}
            />
            {problems.priority ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.priority}</p> : null}
          </div>
          {problems.form ? <p className="text-sm text-[#9F1C26]">{problems.form}</p> : null}
          {!dirty ? <p className="text-xs text-ink/45">No changes to save.</p> : null}
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-ink/[0.06] px-5 py-4">
          <button
            type="button"
            onClick={() => requestClose()}
            disabled={saving}
            className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold text-ink/60 hover:text-navy disabled:opacity-40 ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !dirty}
            className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
          >
            {saving ? 'Saving' : 'Save changes'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
