import { cardClass, errorColor, focusClass } from './ui'

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
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
  `h-11 w-full rounded-lg border bg-white px-3 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink/35 ${focusClass} ${
    invalid ? 'border-[#E0232E]' : 'border-ink/15 focus:border-blue'
  }`

export function PersonalInformation({ baseId, values, errors, dirty, saving, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className={cardClass}>
      <h2 className="text-base font-semibold text-navy">Personal information</h2>
      <p className="mt-1 text-sm leading-6 text-ink/60">The name, email, and phone on this admin account.</p>
      <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
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
      <div className="flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-end">
        {dirty ? <p className="text-sm text-ink/50 sm:mr-auto">Unsaved changes</p> : null}
        <button
          type="submit"
          disabled={!dirty || saving}
          aria-busy={saving}
          className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
        >
          {saving ? 'Saving' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
