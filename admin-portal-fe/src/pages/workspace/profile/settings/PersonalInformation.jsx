import { Check, User } from 'lucide-react'
import { cardClass, errorColor, focusClass, mintChip } from './ui'

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy">
        {label}
      </label>
      {children}
      <p id={error ? `${id}-error` : undefined} className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
        {error}
      </p>
    </div>
  )
}

const inputClass = (invalid) =>
  `h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink/35 ${focusClass} ${
    invalid ? 'border-[#E0232E]' : 'border-ink/10 focus:border-green'
  }`

export function PersonalInformation({ baseId, values, errors, dirty, saving, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className={cardClass}>
      <div className="flex items-start gap-3">
        <span className={mintChip}>
          <User size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-navy">Personal information</h2>
          <p className="mt-0.5 text-sm text-ink/55">The name, email, and phone on this admin account.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-x-6 sm:grid-cols-2">
        <Field id={`${baseId}-first`} label="First name" error={errors.firstName}>
          <input
            id={`${baseId}-first`}
            value={values.firstName}
            autoComplete="given-name"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? `${baseId}-first-error` : undefined}
            onChange={(event) => onChange('firstName', event.target.value)}
            className={inputClass(errors.firstName)}
          />
        </Field>
        <Field id={`${baseId}-last`} label="Last name" error={errors.lastName}>
          <input
            id={`${baseId}-last`}
            value={values.lastName}
            autoComplete="family-name"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={errors.lastName ? `${baseId}-last-error` : undefined}
            onChange={(event) => onChange('lastName', event.target.value)}
            className={inputClass(errors.lastName)}
          />
        </Field>
        <Field id={`${baseId}-email`} label="Email" error={errors.email}>
          <input
            id={`${baseId}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${baseId}-email-error` : undefined}
            onChange={(event) => onChange('email', event.target.value)}
            className={inputClass(errors.email)}
          />
        </Field>
        <Field id={`${baseId}-phone`} label="Phone number" error={errors.phoneNumber}>
          <input
            id={`${baseId}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0550000000"
            value={values.phoneNumber}
            aria-invalid={errors.phoneNumber ? true : undefined}
            aria-describedby={errors.phoneNumber ? `${baseId}-phone-error` : undefined}
            onChange={(event) => onChange('phoneNumber', event.target.value)}
            className={inputClass(errors.phoneNumber)}
          />
        </Field>
      </div>
      <div className="mt-2 flex flex-col gap-3 border-t border-ink/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-end">
        {dirty ? <p className="text-sm text-ink/45 sm:mr-auto">Unsaved changes</p> : null}
        <button
          type="submit"
          disabled={!dirty || saving}
          aria-busy={saving}
          className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
        >
          <Check size={16} strokeWidth={2.4} aria-hidden="true" />
          {saving ? 'Saving' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
