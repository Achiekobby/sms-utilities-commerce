import { AlertCircle, ChevronDown, ImagePlus, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { isClientDirty, validateClientEdit } from '../../../features/clients/clientModel'
import {
  errorItems,
  genders,
  ghanaRegions,
  phoneInput,
  photoError,
  photoTypes,
  todayIso,
} from '../../../features/onboarding/clientOnboarding'
import { cardClass, errorColor, focusClass, inputClass } from './ui'

function RequiredMark() {
  return (
    <span className="text-[#E0232E]" aria-hidden="true">
      {' '}
      *
    </span>
  )
}

function FieldMessage({ id, error, hint }) {
  return (
    <p id={`${id}-message`} className={`mt-1.5 min-h-5 text-sm ${error ? '' : 'text-ink/45'}`} style={error ? { color: errorColor } : undefined}>
      {error || hint || ''}
    </p>
  )
}

function TextInput({ id, label, error, hint, ...props }) {
  const invalid = Boolean(error)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy">
        {label}
        <RequiredMark />
      </label>
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-required="true"
        aria-describedby={`${id}-message`}
        className={inputClass(invalid)}
        {...props}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

function SelectInput({ id, label, value, error, onChange, children }) {
  const invalid = Boolean(error)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy">
        {label}
        <RequiredMark />
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-invalid={invalid || undefined}
          aria-required="true"
          aria-describedby={`${id}-message`}
          onChange={onChange}
          className={`${inputClass(invalid)} appearance-none pr-10`}
        >
          {children}
        </select>
        <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink/40" />
      </div>
      <FieldMessage id={id} error={error} />
    </div>
  )
}

function ErrorSummary({ summaryRef, accountType, errors, formError, fieldIds }) {
  const items = errorItems(accountType, errors).filter((item) => item.key !== 'accountType')
  if (!items.length && !formError) return null
  const heading = items.length
    ? items.length === 1
      ? '1 detail needs attention'
      : `${items.length} details need attention`
    : 'We could not update this client'

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      className="mb-4 rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-4 py-3 focus:outline-2 focus:outline-offset-2 focus:outline-blue"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: errorColor }}>
        <AlertCircle size={16} aria-hidden="true" />
        {heading}
      </h2>
      {items.length ? (
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item.key}>
              <a
                href={`#${fieldIds[item.key]}`}
                className="text-sm underline decoration-[#E0232E]/40 underline-offset-2"
                style={{ color: errorColor }}
                onClick={(event) => {
                  const field = document.getElementById(fieldIds[item.key])
                  if (!field) return
                  event.preventDefault()
                  field.focus()
                }}
              >
                {item.label}: {item.message}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm" style={{ color: errorColor }}>
          {formError}
        </p>
      )}
    </div>
  )
}

export function ClientEditForm({
  accountType,
  saved,
  currentImage,
  errors,
  formError,
  attempt,
  saving,
  onClear,
  onSubmit,
  onCancel,
}) {
  const reactId = useId()
  const summaryRef = useRef(null)
  const previewRef = useRef('')
  const business = accountType === 'business'
  const [values, setValues] = useState(saved)
  const [preview, setPreview] = useState('')
  const regions = saved.region && !ghanaRegions.includes(saved.region) ? [saved.region, ...ghanaRegions] : ghanaRegions
  const dirty = isClientDirty(accountType, values, saved)
  const fieldIds = {
    firstName: `${reactId}-first`,
    lastName: `${reactId}-last`,
    email: `${reactId}-email`,
    phone: `${reactId}-phone`,
    gender: `${reactId}-gender`,
    dateOfBirth: `${reactId}-dob`,
    businessName: `${reactId}-business`,
    region: `${reactId}-region`,
    city: `${reactId}-city`,
    address: `${reactId}-address`,
    profileImage: `${reactId}-photo`,
  }

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  useEffect(() => {
    if (!attempt) return
    const node = summaryRef.current
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.focus()
    node.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [attempt])

  function change(key, value) {
    onClear(key)
    setValues((current) => ({ ...current, [key]: value }))
  }

  function setPhoto(file) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = file instanceof File ? URL.createObjectURL(file) : ''
    previewRef.current = url
    setPreview(url)
    change('profileImage', file)
  }

  function submit(event) {
    event.preventDefault()
    onSubmit(values, validateClientEdit(accountType, values, saved))
  }

  const shownImage = preview || (!values.profileImage ? currentImage : '')
  const photoMessage = photoError(values.profileImage) || errors.profileImage

  return (
    <form onSubmit={submit} noValidate className={`${cardClass} lg:col-span-2`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-navy">Edit details</h2>
          <p className="mt-1 text-sm text-ink/55">
            {business ? 'Business name, contact, and address.' : 'Name, contact, and address.'} A new photo replaces the current one.
          </p>
        </div>
      </div>

      {attempt > 0 ? (
        <div className="mt-4">
          <ErrorSummary summaryRef={summaryRef} accountType={accountType} errors={errors} formError={formError} fieldIds={fieldIds} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
        {business ? (
          <div className="sm:col-span-2">
            <TextInput
              id={fieldIds.businessName}
              name="businessName"
              label="Business name"
              autoComplete="organization"
              maxLength={80}
              value={values.businessName}
              error={errors.businessName}
              onChange={(event) => change('businessName', event.target.value)}
            />
          </div>
        ) : (
          <>
            <TextInput
              id={fieldIds.firstName}
              name="firstName"
              label="First name"
              autoComplete="given-name"
              maxLength={50}
              value={values.firstName}
              error={errors.firstName}
              onChange={(event) => change('firstName', event.target.value)}
            />
            <TextInput
              id={fieldIds.lastName}
              name="lastName"
              label="Last name"
              autoComplete="family-name"
              maxLength={50}
              value={values.lastName}
              error={errors.lastName}
              onChange={(event) => change('lastName', event.target.value)}
            />
            <SelectInput
              id={fieldIds.gender}
              label="Gender"
              value={values.gender}
              error={errors.gender}
              onChange={(event) => change('gender', event.target.value)}
            >
              <option value="">Select</option>
              {genders.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectInput>
            <TextInput
              id={fieldIds.dateOfBirth}
              name="dateOfBirth"
              type="date"
              label="Date of birth"
              autoComplete="bday"
              min="1900-01-01"
              max={todayIso()}
              value={values.dateOfBirth}
              error={errors.dateOfBirth}
              hint="The client must be at least 18."
              onChange={(event) => change('dateOfBirth', event.target.value)}
            />
          </>
        )}

        <div className="sm:col-span-2">
          <TextInput
            id={fieldIds.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            maxLength={120}
            label="Email address"
            value={values.email}
            error={errors.email}
            onChange={(event) => change('email', event.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldIds.phone} className="mb-2 block text-sm font-semibold text-navy">
            Mobile number
            <RequiredMark />
          </label>
          <div
            className={`flex h-12 overflow-hidden rounded-xl border bg-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue ${
              errors.phone ? 'border-[#E0232E]' : 'border-ink/10 focus-within:border-green'
            }`}
          >
            <span className="flex items-center border-r border-ink/10 bg-ink/[0.03] px-3 text-sm font-semibold text-navy">+233</span>
            <input
              id={fieldIds.phone}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="24 123 4567"
              maxLength={20}
              value={values.phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-required="true"
              aria-describedby={`${fieldIds.phone}-message`}
              onChange={(event) => change('phone', phoneInput(event.target.value))}
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink/35"
            />
          </div>
          <FieldMessage id={fieldIds.phone} error={errors.phone} hint="Ghana number, for example 024 123 4567." />
        </div>

        <SelectInput
          id={fieldIds.region}
          label="Region"
          value={values.region}
          error={errors.region}
          onChange={(event) => change('region', event.target.value)}
        >
          <option value="">Select a region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </SelectInput>
        <TextInput
          id={fieldIds.city}
          name="city"
          label="City"
          autoComplete="address-level2"
          maxLength={40}
          value={values.city}
          error={errors.city}
          onChange={(event) => change('city', event.target.value)}
        />
        <div className="sm:col-span-2">
          <TextInput
            id={fieldIds.address}
            name="address"
            label={business ? 'Business address' : 'Address'}
            autoComplete="street-address"
            maxLength={120}
            value={values.address}
            error={errors.address}
            onChange={(event) => change('address', event.target.value)}
          />
        </div>
      </div>

      <div className="mt-1">
        <span id={`${fieldIds.profileImage}-label`} className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-navy">
          {business ? 'Logo' : 'Profile photo'}
          <span className="text-xs font-medium text-ink/40">Optional</span>
        </span>
        <div className="flex items-center gap-3">
          <label
            htmlFor={fieldIds.profileImage}
            className="flex min-h-16 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink/15 bg-white px-3 py-2 hover:border-green/50 focus-within:border-green focus-within:ring-4 focus-within:ring-green/10"
          >
            <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-ink/[0.05]">
              {shownImage ? (
                <img src={shownImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-navy">
                  <ImagePlus size={18} aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-navy">
                {values.profileImage instanceof File ? values.profileImage.name : 'Replace image'}
              </span>
              <span className="block text-xs text-ink/50">JPG, PNG, or WebP up to 2 MB.</span>
            </span>
            <input
              id={fieldIds.profileImage}
              type="file"
              accept={photoTypes.join(',')}
              aria-labelledby={`${fieldIds.profileImage}-label`}
              aria-describedby={`${fieldIds.profileImage}-message`}
              aria-invalid={photoMessage ? true : undefined}
              onChange={(event) => {
                setPhoto(event.target.files?.[0] ?? null)
                event.target.value = ''
              }}
              className="sr-only"
            />
          </label>
          {values.profileImage instanceof File ? (
            <button
              type="button"
              aria-label="Remove the new image"
              onClick={() => setPhoto(null)}
              className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-ink/10 text-ink/55 hover:text-navy ${focusClass}`}
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <FieldMessage id={fieldIds.profileImage} error={photoMessage} />
      </div>

      <div className="mt-2 flex flex-col-reverse gap-3 border-t border-ink/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-end">
        {dirty ? null : <p className="text-sm text-ink/45 sm:mr-auto">No changes to save</p>}
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-semibold text-ink/60 hover:text-navy disabled:opacity-50 ${focusClass}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!dirty || saving}
          aria-busy={saving || undefined}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
        >
          {saving ? 'Saving' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
