import { Check, ImagePlus, Lock, Undo2, X } from 'lucide-react'
import { SelectField } from '../../../../components/SelectField'
import { TextField } from '../../../../components/TextField'
import { genders, ghanaRegions } from '../../../../features/auth/regions'
import { countryCode } from '../../../../features/auth/validation'

const errorColor = '#9F1C26'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const order = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['businessName', 'Business name'],
  ['email', 'Email address'],
  ['phone', 'Mobile number'],
  ['gender', 'Gender'],
  ['dateOfBirth', 'Date of birth'],
  ['region', 'Region'],
  ['city', 'City'],
  ['address', 'Address'],
  ['profileImage', 'Profile photo'],
]

function ErrorSummary({ summaryRef, errors, fieldIds, isBusiness }) {
  const items = order
    .filter(([key]) => errors[key])
    .map(([key, label]) => [key, key === 'profileImage' && isBusiness ? 'Logo' : label])
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
  summaryRef,
  showSummary,
  onChange,
  onBlur,
  onDiscard,
  onSubmit,
  submitting = false,
  formError = '',
  currentPhoto = '',
  hidePhoto = false,
}) {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6"
    >
      {showSummary ? (
        <ErrorSummary summaryRef={summaryRef} errors={errors} fieldIds={fieldIds} isBusiness={isBusiness} />
      ) : null}

      {isBusiness ? (
        <section aria-labelledby="profile-business">
          <h2 id="profile-business" className="text-base font-bold text-navy">
            Business
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
            This name is the workspace in the sidebar, and the organisation on sender ID requests.
          </p>
          {hidePhoto ? null : (
            <div className="mt-5 scroll-mt-28">
              <PhotoField
                id={fieldIds.profileImage}
                label="Logo"
                file={values.profileImage}
                preview={values.photoUrl || currentPhoto}
                error={errors.profileImage}
                onSelect={(file) => onChange('profileImage', file)}
                onClear={() => onChange('profileImage', null)}
              />
            </div>
          )}
          <div className="scroll-mt-28">
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
        </section>
      ) : (
        <section aria-labelledby="profile-person">
          <h2 id="profile-person" className="text-base font-bold text-navy">
            Person
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
            The name on your wallet and on messages you send yourself.
          </p>
          {hidePhoto ? null : (
            <div className="mt-5 scroll-mt-28">
              <PhotoField
                id={fieldIds.profileImage}
                file={values.profileImage}
                preview={values.photoUrl || currentPhoto}
                error={errors.profileImage}
                onSelect={(file) => onChange('profileImage', file)}
                onClear={() => onChange('profileImage', null)}
              />
            </div>
          )}
          <div className="grid gap-x-4 sm:grid-cols-2">
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
          <div className="grid gap-x-4 sm:grid-cols-2">
            <div className="scroll-mt-28">
              <SelectField
                id={fieldIds.gender}
                label="Gender"
                value={values.gender}
                error={errors.gender}
                onChange={(event) => onChange('gender', event.target.value)}
              >
                <option value="">Select</option>
                {genders.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="scroll-mt-28">
              <TextField
                id={fieldIds.dateOfBirth}
                name="dateOfBirth"
                type="date"
                label="Date of birth"
                autoComplete="bday"
                value={values.dateOfBirth}
                error={errors.dateOfBirth}
                onChange={(event) => onChange('dateOfBirth', event.target.value)}
                onBlur={(event) => onBlur('dateOfBirth', event.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="profile-contact" className="mt-2 border-t border-ink/10 pt-6">
        <h2 id="profile-contact" className="text-base font-bold text-navy">
          Contact
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
          {isBusiness
            ? 'Login codes, receipts, and the number on this business account.'
            : 'Login codes, receipts, and the number used for airtime, data, and bills.'}
        </p>
        <div className="mt-5 scroll-mt-28">
          <TextField
            id={fieldIds.email}
            name="email"
            type="email"
            label="Email address"
            hint="This email is how you sign in. Contact us if you or your business need to change it."
            autoComplete="email"
            value={values.email}
            readOnly
            suffix={<Lock size={15} strokeWidth={2.2} aria-hidden="true" className="mr-4 shrink-0 text-ink/40" />}
          />
        </div>
        <div className="scroll-mt-28">
          <TextField
            id={fieldIds.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            label="Mobile number"
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

      <section aria-labelledby="profile-address" className="mt-2 border-t border-ink/10 pt-6">
        <h2 id="profile-address" className="text-base font-bold text-navy">
          Address
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
          {isBusiness ? 'Where this business is registered.' : 'The address on this account.'}
        </p>
        <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
          <div className="scroll-mt-28">
            <SelectField
              id={fieldIds.region}
              label="Region"
              value={values.region}
              error={errors.region}
              onChange={(event) => onChange('region', event.target.value)}
            >
              <option value="">Select a region</option>
              {ghanaRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="scroll-mt-28">
            <TextField
              id={fieldIds.city}
              name="city"
              label="City"
              autoComplete="address-level2"
              value={values.city}
              error={errors.city}
              onChange={(event) => onChange('city', event.target.value)}
              onBlur={(event) => onBlur('city', event.target.value)}
            />
          </div>
        </div>
        <div className="scroll-mt-28">
          <TextField
            id={fieldIds.address}
            name="address"
            label={isBusiness ? 'Business address' : 'Address'}
            placeholder="Street and area"
            autoComplete="street-address"
            value={values.address}
            error={errors.address}
            onChange={(event) => onChange('address', event.target.value)}
            onBlur={(event) => onBlur('address', event.target.value)}
          />
        </div>
      </section>

      <div className="mt-2 flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" aria-live="polite" className="flex min-h-5 items-center text-sm font-medium">
          {formError ? <span style={{ color: errorColor }}>{formError}</span> : null}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            disabled={!dirty || submitting}
            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink/30 ${focusClass}`}
          >
            <Undo2 size={15} strokeWidth={2.2} aria-hidden="true" />
            Discard
          </button>
          <button
            type="submit"
            disabled={!dirty || submitting}
            aria-busy={submitting}
            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/35 disabled:shadow-none ${focusClass}`}
          >
            <Check size={16} strokeWidth={2.4} aria-hidden="true" />
            {submitting ? 'Saving' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  )
}

const photoTypes = ['image/jpeg', 'image/png', 'image/webp']

function PhotoField({ id, file, preview, error, onSelect, onClear, label = 'Profile photo' }) {
  const noun = label === 'Logo' ? 'logo' : 'photo'

  return (
    <div>
      <span id={`${id}-label`} className="mb-2 block text-sm font-medium text-navy">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <label
          htmlFor={id}
          className="relative flex h-12 min-w-0 flex-1 cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-ink/15 bg-white px-3 transition-all duration-200 hover:border-blue/40 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15"
        >
          <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-ink/[0.06]">
            {preview ? (
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-navy">
                <ImagePlus size={16} aria-hidden="true" />
              </span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-navy">
              {file ? file.name : preview ? `Change ${noun}` : `Add a ${noun}`}
            </span>
            <span className="block text-xs text-ink/50">JPG, PNG, or WebP. Optional.</span>
          </span>
          <input
            id={id}
            name="profileImage"
            type="file"
            accept={photoTypes.join(',')}
            aria-labelledby={`${id}-label`}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null
              event.target.value = ''
              onSelect(next)
            }}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer text-[0px] opacity-0"
          />
        </label>
        {file ? (
          <button
            type="button"
            aria-label="Remove profile photo"
            onClick={onClear}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-ink/15 text-ink/60 hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p id={`${id}-error`} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
        {error}
      </p>
    </div>
  )
}
