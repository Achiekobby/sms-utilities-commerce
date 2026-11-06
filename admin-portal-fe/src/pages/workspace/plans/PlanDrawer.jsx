import { Check, Plus, Star, Trash2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  blankDetails,
  formatUnits,
  labelize,
  monthSpan,
  money,
  planCreateBody,
  planFieldErrors,
  planSignature,
  planUpdateBody,
  validatePlan,
  valuesFromPlan,
} from '../../../features/plans/planModel'
import { useCreatePlanMutation, useGetPlanQuery, useUpdatePlanMutation } from '../../../services/api/plans/plansApi'
import { focusClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    featured: 'bg-[#FFF4DF] text-[#9A5B00]',
    neutral: 'bg-[#F3F6FB] text-navy',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

function FieldError({ id, children }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1 text-xs text-[#9F1C26]">
      {children}
    </p>
  )
}

export function PlanDrawer({ mode, id, onClose, onEdit }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const creating = mode === 'create'
  const editing = mode === 'edit'
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPlanQuery(id, { skip: creating || !id })
  const plan = data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : null
  const waiting = !creating && !plan && (isLoading || isFetching) && !isError
  const [createPlan, { isLoading: creatingPlan }] = useCreatePlanMutation()
  const [updatePlan, { isLoading: updatingPlan }] = useUpdatePlanMutation()
  const saving = creatingPlan || updatingPlan
  const notify = useNotify()

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

  const title = creating ? 'New plan' : editing ? 'Edit plan' : plan?.name || 'Plan'
  const eyebrow = creating ? 'Create' : editing ? 'Update' : 'Plan'

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
      className={`${closing ? 'drawer-right-out' : 'drawer-right'} fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(36rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">{eyebrow}</p>
          <h2 id={titleId} className="mt-1 truncate text-lg font-bold tracking-tight text-navy">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={requestClose}
          disabled={saving}
          aria-label="Close plan"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      {waiting ? <PlanSkeleton /> : null}

      {!creating && isError && !plan ? (
        <div className="px-5 py-6">
          <div className="rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-4 py-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {creating || (editing && plan) ? (
        <PlanForm
          mode={mode}
          plan={plan}
          saving={saving}
          onCancel={requestClose}
          onCreate={createPlan}
          onUpdate={updatePlan}
          notify={notify}
          onDone={() => requestClose(true)}
        />
      ) : null}

      {!creating && !editing && plan ? <PlanSummary plan={plan} onEdit={onEdit} /> : null}
    </dialog>
  )
}

function PlanSummary({ plan, onEdit }) {
  const details = Array.isArray(plan.details) ? plan.details : []
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={plan.status === 'active' ? 'good' : 'neutral'}>{labelize(plan.status) || 'Unknown'}</Badge>
          {plan.is_featured ? (
            <Badge tone="featured">
              <Star size={12} strokeWidth={2.2} aria-hidden="true" className="mr-1" />
              Featured
            </Badge>
          ) : (
            <Badge>Not featured</Badge>
          )}
        </div>
        <h3 className="mt-5 text-sm font-semibold text-navy">Durations</h3>
        {details.length ? (
          <ul className="mt-3 space-y-2">
            {details.map((row, index) => (
              <li key={`${row.months}-${index}`} className="rounded-xl border border-ink/[0.06] bg-[#F7FAFC] px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-navy">{monthSpan(row.months)}</span>
                  <span className="text-sm font-semibold text-navy tabular-nums">{money(row.price)}</span>
                </div>
                <p className="mt-0.5 text-xs text-ink/50 tabular-nums">{formatUnits(row.units)} SMS units</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/55">This plan has no durations yet.</p>
        )}
      </div>
      <footer className="border-t border-ink/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={onEdit}
          className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white hover:bg-[#0a3268] ${focusClass}`}
        >
          Edit plan
        </button>
      </footer>
    </>
  )
}

function PlanForm({ mode, plan, saving, onCancel, onCreate, onUpdate, notify, onDone }) {
  const nameId = useId()
  const creating = mode === 'create'
  const [values, setValues] = useState(() => (creating ? { name: '', status: 'active', featured: false, details: blankDetails() } : valuesFromPlan(plan)))
  const [errors, setErrors] = useState({})
  const savedSignature = creating ? '' : planSignature(valuesFromPlan(plan))
  const dirty = creating || planSignature(values) !== savedSignature

  function setName(name) {
    setValues((current) => ({ ...current, name }))
    setErrors((current) => ({ ...current, name: undefined }))
  }

  function setDetail(index, key, value) {
    setValues((current) => ({
      ...current,
      details: current.details.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    }))
    setErrors((current) => {
      if (!current.rows?.[index]) return current
      const nextRow = { ...current.rows[index], [key]: undefined }
      return { ...current, rows: { ...current.rows, [index]: nextRow }, details: undefined }
    })
  }

  function addDuration() {
    setValues((current) => {
      const used = new Set(current.details.map((row) => Number(row.months)))
      let months = 1
      while (used.has(months) && months < 36) months += 1
      return { ...current, details: [...current.details, { months: String(months), units: '', price: '' }] }
    })
    setErrors((current) => ({ ...current, details: undefined }))
  }

  function removeDuration(index) {
    setValues((current) => ({ ...current, details: current.details.filter((_, rowIndex) => rowIndex !== index) }))
    setErrors((current) => ({ ...current, rows: {}, details: undefined }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    const found = validatePlan(values)
    setErrors(found)
    if (Object.keys(found).length) {
      if (found.name) document.getElementById(nameId)?.focus()
      else {
        const index = Object.keys(found.rows ?? {})[0]
        const row = found.rows?.[index] ?? {}
        const key = row.months ? 'months' : row.units ? 'units' : 'price'
        document.getElementById(`${nameId}-${key}-${index}`)?.focus()
      }
      return
    }

    try {
      if (creating) {
        const result = await onCreate(planCreateBody(values)).unwrap()
        notify.success(result?.message || 'Plan created.')
      } else {
        const result = await onUpdate({ id: plan.id, body: planUpdateBody(values) }).unwrap()
        notify.success(result?.message || 'Plan updated.')
      }
      onDone()
    } catch (failure) {
      const next = planFieldErrors(failure)
      setErrors(next)
      notify.error(apiErrorMessage(failure))
    }
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
        <div>
          <label htmlFor={nameId} className="text-sm font-semibold text-navy">
            Plan name
          </label>
          <input
            id={nameId}
            value={values.name}
            maxLength={80}
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            onChange={(event) => setName(event.target.value)}
            className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-green ${focusClass} ${
              errors.name ? 'border-[#E0232E]' : 'border-ink/10'
            }`}
          />
          <FieldError id={`${nameId}-error`}>{errors.name}</FieldError>
        </div>

        {creating ? (
          <p className="rounded-xl bg-[#F7FBF9] px-3 py-2.5 text-sm text-ink/60">
            New plans start active and are not featured. You can change that after the plan is saved.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className="text-sm font-semibold text-navy">Status</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['active', 'inactive'].map((status) => {
                  const selected = values.status === status
                  return (
                    <label
                      key={status}
                      onMouseDown={(event) => event.preventDefault()}
                      className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                        selected ? 'border-green bg-[#E7F8F0] font-semibold text-navy' : 'border-ink/10 font-medium text-ink/70'
                      }`}
                    >
                      {labelize(status)}
                      <input
                        type="radio"
                        name="plan-status"
                        value={status}
                        checked={selected}
                        onChange={() => setValues((current) => ({ ...current, status }))}
                        className="sr-only outline-none"
                      />
                    </label>
                  )
                })}
              </div>
              <FieldError>{errors.status}</FieldError>
            </fieldset>
            <div>
              <p className="text-sm font-semibold text-navy">Featured</p>
              <label
                onMouseDown={(event) => event.preventDefault()}
                className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm font-medium text-navy has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue"
              >
                Show as a featured plan
                <input
                  type="checkbox"
                  checked={values.featured}
                  onChange={(event) => setValues((current) => ({ ...current, featured: event.target.checked }))}
                  className="size-4 accent-green outline-none"
                />
              </label>
              <FieldError>{errors.featured}</FieldError>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-navy">Durations</h3>
            <button
              type="button"
              onClick={addDuration}
              disabled={values.details.length >= 12}
              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-green hover:bg-[#E7F8F0] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
            >
              <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
              Add duration
            </button>
          </div>
          <p className="mt-1 text-sm text-ink/55">Each row is a billing length, the SMS units included, and the price in GHS.</p>
          {errors.details ? <p className="mt-2 text-xs text-[#9F1C26]">{errors.details}</p> : null}
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-[5.5rem_1fr_1fr_2.25rem] gap-2 px-1 text-xs font-medium text-ink/45">
              <span>Months</span>
              <span>Units</span>
              <span>Price</span>
              <span className="sr-only">Remove</span>
            </div>
            {values.details.map((row, index) => {
              const rowErrors = errors.rows?.[index] ?? {}
              const monthsId = `${nameId}-months-${index}`
              const unitsId = `${nameId}-units-${index}`
              const priceId = `${nameId}-price-${index}`
              return (
                <div key={index} className="rounded-xl border border-ink/[0.06] bg-[#F7FAFC] p-2">
                  <div className="grid grid-cols-[5.5rem_1fr_1fr_2.25rem] gap-2">
                    <div>
                      <label htmlFor={monthsId} className="sr-only">
                        Months for duration {index + 1}
                      </label>
                      <input
                        id={monthsId}
                        inputMode="numeric"
                        value={row.months}
                        aria-invalid={rowErrors.months ? true : undefined}
                        aria-describedby={rowErrors.months ? `${monthsId}-error` : undefined}
                        onChange={(event) => setDetail(index, 'months', event.target.value)}
                        className={`h-10 w-full rounded-lg border bg-white px-2 text-sm text-ink outline-none focus:border-green ${focusClass} ${
                          rowErrors.months ? 'border-[#E0232E]' : 'border-ink/10'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor={unitsId} className="sr-only">
                        Units for duration {index + 1}
                      </label>
                      <input
                        id={unitsId}
                        inputMode="numeric"
                        value={row.units}
                        aria-invalid={rowErrors.units ? true : undefined}
                        aria-describedby={rowErrors.units ? `${unitsId}-error` : undefined}
                        onChange={(event) => setDetail(index, 'units', event.target.value)}
                        className={`h-10 w-full rounded-lg border bg-white px-2 text-sm text-ink outline-none focus:border-green ${focusClass} ${
                          rowErrors.units ? 'border-[#E0232E]' : 'border-ink/10'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor={priceId} className="sr-only">
                        Price for duration {index + 1}
                      </label>
                      <input
                        id={priceId}
                        inputMode="decimal"
                        value={row.price}
                        aria-invalid={rowErrors.price ? true : undefined}
                        aria-describedby={rowErrors.price ? `${priceId}-error` : undefined}
                        onChange={(event) => setDetail(index, 'price', event.target.value)}
                        className={`h-10 w-full rounded-lg border bg-white px-2 text-sm text-ink outline-none focus:border-green ${focusClass} ${
                          rowErrors.price ? 'border-[#E0232E]' : 'border-ink/10'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove duration ${index + 1}`}
                      onClick={() => removeDuration(index)}
                      disabled={values.details.length <= 1}
                      className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-ink/45 hover:bg-white hover:text-[#9F1C26] disabled:cursor-not-allowed disabled:opacity-30 ${focusClass}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                  {rowErrors.months || rowErrors.units || rowErrors.price ? (
                    <p className="mt-1.5 px-1 text-xs text-[#9F1C26]">{rowErrors.months || rowErrors.units || rowErrors.price}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <footer className="flex items-center justify-between gap-3 border-t border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold text-ink/60 hover:text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
          >
            Cancel
          </button>
          {!creating && !dirty ? <p className="px-3 text-xs text-ink/45">No changes to save.</p> : null}
        </div>
        <button
          type="submit"
          disabled={saving || !dirty}
          className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          {saving ? <Check size={15} className="animate-pulse" aria-hidden="true" /> : null}
          {saving ? 'Saving' : creating ? 'Create plan' : 'Save changes'}
        </button>
      </footer>
    </form>
  )
}

function PlanSkeleton() {
  return (
    <div className="space-y-3 px-5 py-5" aria-hidden="true">
      <div className="skeleton h-6 w-32 rounded-full" />
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
    </div>
  )
}
