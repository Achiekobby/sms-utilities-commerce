import { Check, Undo2 } from 'lucide-react'
import { countryCode } from '../../../../features/auth/validation'
import { TextField } from '../../../../components/TextField'

const errorColor = '#9F1C26'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const order = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['email', 'Email address'],
  ['phone', 'Mobile number'],
  ['businessName', 'Business name'],
  ['address', 'Business address'],
]

function ErrorSummary({ summaryRef, errors, fieldIds }) {
  const items = order.filter(([key]) => errors[key])
  if (items.length === 0) return null

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="profile-error-title"
      className="mb-6 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 focus:outline-2 focus:outline-offset-2 focus:outline-blue"
    >
      <h2 id="profile-error-title" className="text-sm font-semibold" style={{ color: errorColor }}>
        Check these details
      </h2>
      <ul className="mt-2 space-y-1">
        {items.map(([key, label]) => (
          <li key={key}>
            <a
              href={`#${fieldIds[key]}`}
              className="text-sm underline underline-offset-2"
              style={{ color: errorColor }}
            >
              {label}: {errors[key]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProfileForm({
  isBusiness,
  values,
  errors,
  fieldIds,
  dirty,
  status,
  summaryRef,
  showSummary,
  onChange,
  onBlur,
  onDiscard,
  onSubmit,
}) {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6"
    >
      {showSummary ? <ErrorSummary summaryRef={summaryRef} errors={errors} fieldIds={fieldIds} /> : null}

      <section aria-labelledby="profile-person">
        <h2 id="profile-person" className="text-base font-bold text-navy">
          Person
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
          {isBusiness
            ? 'The person who signs in. Wallet receipts use this name.'
            : 'The name on your wallet and on messages you send yourself.'}
        </p>

        <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
          <div className="scroll-mt-28">
            <TextField
              id={fieldIds.firstName}
              name="firstName"
              label="First name"
              autoComplete="given-name"
              value={values.firstName}
              error={errors.firstName}
              onChange={(event) => onChange('firstName', event.target.value)}
              onBlur={(event) => onBlur('firstName', event.target.value)}
            />
          </div>
          <div className="scroll-mt-28">
            <TextField
              id={fieldIds.lastName}
              name="lastName"
              label="Last name"
              autoComplete="family-name"
              value={values.lastName}
              error={errors.lastName}
              onChange={(event) => onChange('lastName', event.target.value)}
              onBlur={(event) => onBlur('lastName', event.target.value)}
            />
          </div>
        </div>

        <div className="scroll-mt-28">
          <TextField
            id={fieldIds.email}
            name="email"
            type="email"
            inputMode="email"
            label="Email address"
            hint="Login codes, receipts, and delivery reports go here."
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={(event) => onChange('email', event.target.value)}
            onBlur={(event) => onBlur('email', event.target.value)}
          />
        </div>

        <div className="scroll-mt-28">
          <TextField
            id={fieldIds.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            label="Mobile number"
            hint={
              isBusiness
                ? 'The contact number on this business account.'
                : 'Used for airtime, data, bills, and wallet alerts.'
            }
            placeholder="24 123 4567"
            autoComplete="tel-national"
            prefix={countryCode}
            maxLength={13}
            value={values.phone}
            error={errors.phone}
            onChange={(event) => onChange('phone', event.target.value.replace(/[^\d\s]/g, ''))}
            onBlur={(event) => onBlur('phone', event.target.value)}
          />
        </div>
      </section>

      {isBusiness ? (
        <section aria-labelledby="profile-business" className="mt-2 border-t border-ink/10 pt-6">
          <h2 id="profile-business" className="text-base font-bold text-navy">
            Business
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
            This name is the workspace in the sidebar, and the organisation on sender ID requests.
          </p>

          <div className="mt-5 scroll-mt-28">
            <TextField
              id={fieldIds.businessName}
              name="businessName"
              label="Business name"
              autoComplete="organization"
              value={values.businessName}
              error={errors.businessName}
              onChange={(event) => onChange('businessName', event.target.value)}
              onBlur={(event) => onBlur('businessName', event.target.value)}
            />
          </div>
          <div className="scroll-mt-28">
            <TextField
              id={fieldIds.address}
              name="address"
              label="Business address"
              hint="Street, area, and city. Shown on invoices for this workspace."
              placeholder="Street, area, city"
              autoComplete="street-address"
              value={values.address}
              error={errors.address}
              onChange={(event) => onChange('address', event.target.value)}
              onBlur={(event) => onBlur('address', event.target.value)}
            />
          </div>
        </section>
      ) : null}

      <div className="mt-2 flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" aria-live="polite" className="flex min-h-5 items-center gap-1.5 text-sm font-medium text-green">
          {status ? (
            <>
              <Check size={15} strokeWidth={2.4} aria-hidden="true" />
              {status}
            </>
          ) : null}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            disabled={!dirty}
            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink/30 ${focusClass}`}
          >
            <Undo2 size={15} strokeWidth={2.2} aria-hidden="true" />
            Discard
          </button>
          <button
            type="submit"
            disabled={!dirty}
            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/35 disabled:shadow-none ${focusClass}`}
          >
            <Check size={16} strokeWidth={2.4} aria-hidden="true" />
            Save changes
          </button>
        </div>
      </div>
    </form>
  )
}
