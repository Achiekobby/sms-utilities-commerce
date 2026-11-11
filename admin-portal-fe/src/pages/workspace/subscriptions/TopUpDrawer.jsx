import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { apiErrorMessage, fieldErrors } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import { detailLabel, formatUnits, isNonExpiryDetail, money, topUpBody } from '../../../features/subscriptions/subscriptionModel'
import { useGetClientPlansQuery } from '../../../services/api/plans/plansApi'
import { useActivateSubscriptionMutation } from '../../../services/api/subscriptions/subscriptionsApi'
import { focusClass } from './ui'

function preferredDetail(details) {
  return details.find((row) => isNonExpiryDetail(row)) ?? details[0] ?? null
}

function detailKey(row, index) {
  return `${row.months ?? 'x'}-${row.units ?? 'u'}-${index}`
}

export function TopUpDrawer({ clientId, clientName, onClose, onActivated }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const [planId, setPlanId] = useState('')
  const [months, setMonths] = useState('')
  const [problems, setProblems] = useState({})
  const notify = useNotify()
  const { data, isLoading, isError, error, refetch } = useGetClientPlansQuery({ page: 1, perPage: 50 })
  const [activate, { isLoading: saving }] = useActivateSubscriptionMutation()
  const plans = (Array.isArray(data?.data) ? data.data : []).filter((plan) => plan.status === 'active')
  const selected = plans.find((plan) => String(plan.id) === String(planId))
  const details = Array.isArray(selected?.details) ? selected.details : []
  const chosen = details.find((row) => String(row.months) === String(months))
  const hasMonths = months !== ''

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

  function choosePlan(plan) {
    const rows = Array.isArray(plan.details) ? plan.details : []
    const pick = preferredDetail(rows)
    setPlanId(String(plan.id))
    setMonths(pick?.months == null ? '' : String(pick.months))
    setProblems({})
  }

  async function onSubmit(event) {
    event.preventDefault()
    const next = {}
    if (!selected) next.plan = 'Choose a plan.'
    if (!hasMonths || !chosen) next.months = 'Choose a duration.'
    setProblems(next)
    if (Object.keys(next).length) return

    try {
      const result = await activate({ clientId, body: topUpBody(planId, months) }).unwrap()
      notify.success(result?.message || 'Subscription activated.')
      onActivated?.()
      requestClose(true)
    } catch (failure) {
      const fields = fieldErrors(failure)
      setProblems({
        plan: fields.plan_id,
        months: fields.months,
        form: fields.type,
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
      className={`${closing ? 'drawer-right-out' : 'drawer-right'} fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(28rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Top up</p>
          <h2 id={titleId} className="mt-1 text-lg font-bold tracking-tight text-navy">
            Add credit
          </h2>
          <p className="mt-1 truncate text-sm text-ink/55">{clientName}</p>
        </div>
        <button
          type="button"
          onClick={() => requestClose()}
          disabled={saving}
          aria-label="Close top up"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
          <p className="rounded-xl bg-[#F7FBF9] px-3 py-2.5 text-sm text-ink/60">
            Assigns the selected SMS unit bundle as non-expiring credit for this client.
          </p>
          {isLoading ? <div className="skeleton h-24 rounded-xl" aria-hidden="true" /> : null}
          {isError ? (
            <div role="alert">
              <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
              <button type="button" onClick={refetch} className={`mt-3 text-sm font-semibold text-blue ${focusClass}`}>
                Try again
              </button>
            </div>
          ) : null}
          {!isLoading && !isError && !plans.length ? <p className="text-sm text-ink/55">No active plans are available.</p> : null}
          {plans.length ? (
            <fieldset>
              <legend className="text-sm font-semibold text-navy">Plan</legend>
              <div className="mt-2 grid gap-2">
                {plans.map((plan) => {
                  const picked = String(plan.id) === String(planId)
                  return (
                    <label
                      key={plan.id}
                      onMouseDown={(event) => event.preventDefault()}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                        picked ? 'border-green bg-[#E7F8F0] font-semibold text-navy' : 'border-ink/10 font-medium text-ink/70'
                      }`}
                    >
                      {plan.name}
                      <input
                        type="radio"
                        name="top-up-plan"
                        value={plan.id}
                        checked={picked}
                        onChange={() => choosePlan(plan)}
                        className="sr-only outline-none"
                      />
                    </label>
                  )
                })}
              </div>
              {problems.plan ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.plan}</p> : null}
            </fieldset>
          ) : null}
          {selected ? (
            <fieldset>
              <legend className="text-sm font-semibold text-navy">Unit bundle</legend>
              {details.length ? (
                <div className="mt-2 grid gap-2">
                  {details.map((row, index) => {
                    const picked = String(months) === String(row.months)
                    return (
                      <label
                        key={detailKey(row, index)}
                        onMouseDown={(event) => event.preventDefault()}
                        className={`cursor-pointer rounded-xl border px-3 py-2.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                          picked ? 'border-green bg-[#E7F8F0]' : 'border-ink/10'
                        }`}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-semibold text-navy">{detailLabel(row)}</span>
                          <span className="text-sm font-semibold text-navy tabular-nums">{money(row.price)}</span>
                        </span>
                        <span className="mt-0.5 block text-xs text-ink/50 tabular-nums">{formatUnits(row.units)} SMS units</span>
                        <input
                          type="radio"
                          name="top-up-months"
                          value={row.months}
                          checked={picked}
                          onChange={() => {
                            setMonths(String(row.months))
                            setProblems((current) => ({ ...current, months: undefined }))
                          }}
                          className="sr-only outline-none"
                        />
                      </label>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-2 text-sm text-ink/55">This plan has no unit bundles to assign.</p>
              )}
              {problems.months ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.months}</p> : null}
            </fieldset>
          ) : null}
          {problems.form ? <p className="text-sm text-[#9F1C26]">{problems.form}</p> : null}
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
            disabled={saving || !selected || !hasMonths || !chosen}
            className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
          >
            {saving ? 'Activating' : 'Activate subscription'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
