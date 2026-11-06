import { AlertCircle, Building2, Check, ChevronDown, ImagePlus, User, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import {
  errorItems,
  genders,
  ghanaRegions,
  phoneInput,
  photoTypes,
  todayIso,
} from '../../../features/onboarding/clientOnboarding'
import { cardClass, errorColor, focusClass, inputClass } from './ui'

const accountTypes = [
  {
    id: 'individual',
    title: 'Individual',
    text: 'A person. Collect their name, gender, and date of birth.',
    icon: User,
  },
  {
    id: 'business',
    title: 'Business',
    text: 'A company. Collect the business name instead of a personal name.',
    icon: Building2,
  },
]

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
    <p
      id={`${id}-message`}
      className={`mt-1.5 min-h-5 text-sm ${error ? '' : 'text-ink/45'}`}
      style={error ? { color: errorColor } : undefined}
    >
      {error || hint || ''}
    </p>
  )
}

function TextInput({ id, label, error, hint, optional, ...props }) {
  const invalid = Boolean(error)
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-navy">
        <span>
          {label}
          {optional ? null : <RequiredMark />}
        </span>
        {optional ? <span className="text-xs font-medium text-ink/40">Optional</span> : null}
      </label>
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-required={optional ? undefined : true}
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
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink/40"
        />
      </div>
      <FieldMessage id={id} error={error} />
    </div>
  )
}

function ErrorSummary({ summaryRef, accountType, errors, formError, fieldIds }) {
  const items = errorItems(accountType, errors)
  if (!items.length && !formError) return null
  const heading = items.length
    ? items.length === 1
      ? '1 detail needs attention'
      : `${items.length} details need attention`
    : 'We could not onboard this client'

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="onboard-error-title"
      className="mb-4 rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-4 py-3 focus:outline-2 focus:outline-offset-2 focus:outline-blue"
    >
      <h2 id="onboard-error-title" className="flex items-center gap-2 text-sm font-semibold" style={{ color: errorColor }}>
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
                  const target = field instanceof HTMLFieldSetElement ? field.querySelector('input') : field
                  target?.focus({ focusVisible: true })
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

function AccountTypeField({ id, value, error, onChange }) {
  return (
    <fieldset id={id}>
      <legend className="mb-3 text-sm font-semibold text-navy">
        Account type
        <RequiredMark />
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {accountTypes.map((type) => {
          const Icon = type.icon
          const selected = value === type.id
          return (
            <label
              key={type.id}
              onMouseDown={(event) => event.preventDefault()}
              className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                selected ? 'border-green bg-[#E7F8F0]/70 ring-4 ring-green/10' : 'border-ink/10 hover:border-green/40'
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value={type.id}
                checked={selected}
                onChange={() => onChange(type.id)}
                className="sr-only outline-none"
              />
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  selected ? 'bg-green text-white' : 'bg-ink/[0.05] text-navy'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-navy">{type.title}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-ink/60">{type.text}</span>
              </span>
              <span
                aria-hidden="true"
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  selected ? 'border-green bg-green text-white' : 'border-ink/15 text-transparent'
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </span>
            </label>
          )
        })}
      </div>
      <p className="mt-2 min-h-5 text-sm" style={{ color: errorColor }}>
        {error}
      </p>
    </fieldset>
  )
}

function PhotoField({ id, label, file, preview, error, onSelect, onClear }) {
  const [dragging, setDragging] = useState(false)

  function take(fileList) {
    onSelect(fileList?.[0] ?? null)
  }

  return (
    <div>
      <span id={`${id}-label`} className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-navy">
        {label}
        <span className="text-xs font-medium text-ink/40">Optional</span>
      </span>
      <div className="flex items-center gap-3">
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget)) return
            setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            take(event.dataTransfer.files)
          }}
          className={`flex min-h-16 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3 py-2 transition-colors ${
            dragging ? 'border-green bg-[#E7F8F0]' : 'border-ink/15 bg-white hover:border-green/50'
          } focus-within:border-green focus-within:ring-4 focus-within:ring-green/10`}
        >
          <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-ink/[0.05]">
            {preview ? (
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-navy">
                <ImagePlus size={18} aria-hidden="true" />
              </span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-navy">{file ? file.name : 'Add an image'}</span>
            <span className="block text-xs text-ink/50">Drag it here, or browse. JPG, PNG, or WebP up to 2 MB.</span>
          </span>
          <input
            id={id}
            type="file"
            accept={photoTypes.join(',')}
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-message`}
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              take(event.target.files)
              event.target.value = ''
            }}
            className="sr-only"
          />
        </label>
        {file ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${label.toLowerCase()}`}
            className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-ink/10 text-ink/55 hover:text-navy ${focusClass}`}
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <FieldMessage id={id} error={error} />
    </div>
  )
}

function SectionLabel({ children }) {
  return <h2 className="mt-2 mb-4 text-xs font-semibold tracking-[0.14em] text-ink/40 uppercase">{children}</h2>
}

export function OnboardingForm({
  accountType,
  values,
  errors,
  formError,
  attempt,
  focusToken,
  submitting,
  preview,
  onType,
  onChange,
  onSubmit,
  onClear,
}) {
  const reactId = useId()
  const summaryRef = useRef(null)
  const focusedToken = useRef(0)
  const business = accountType === 'business'
  const fieldIds = {
    accountType: `${reactId}-type`,
    firstName: `${reactId}-first`,
    lastName: `${reactId}-last`,
    email: `${reactId}-email`,
    phone: `${reactId}-phone`,
    gender: `${reactId}-gender`,
    dateOfBirth: `${reactId}-dob`,
    region: `${reactId}-region`,
    city: `${reactId}-city`,
    address: `${reactId}-address`,
    businessName: `${reactId}-business`,
    profileImage: `${reactId}-photo`,
  }

  useEffect(() => {
    if (!attempt) return
    const node = summaryRef.current
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.focus()
    node.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [attempt])

  useEffect(() => {
    if (!focusToken || focusedToken.current === focusToken) return
    focusedToken.current = focusToken
    const field = accountType === 'business' ? fieldIds.email : fieldIds.firstName
    document.getElementById(field)?.focus()
  }, [focusToken, accountType, fieldIds.email, fieldIds.firstName])

  return (
    <form onSubmit={onSubmit} noValidate className={`${cardClass} flex flex-col gap-1`}>
      <div className="mb-2">
        <h2 className="text-lg font-bold tracking-tight text-navy">Client details</h2>
        <p className="mt-1 text-sm text-ink/55">Fields marked with * are required. The photo can wait.</p>
      </div>

      {attempt > 0 ? (
        <ErrorSummary
          summaryRef={summaryRef}
          accountType={accountType}
          errors={errors}
          formError={formError}
          fieldIds={fieldIds}
        />
      ) : null}

      <AccountTypeField id={fieldIds.accountType} value={accountType} error={errors.accountType} onChange={onType} />

      {accountType ? (
        <div key={accountType} className="profile-in">
          <SectionLabel>Contact</SectionLabel>
          {business ? null : (
            <div className="grid gap-x-4 sm:grid-cols-2">
              <TextInput
                id={fieldIds.firstName}
                name="firstName"
                label="First name"
                autoComplete="given-name"
                maxLength={50}
                value={values.firstName}
                error={errors.firstName}
                onChange={(event) => onChange('firstName', event.target.value)}
              />
              <TextInput
                id={fieldIds.lastName}
                name="lastName"
                label="Last name"
                autoComplete="family-name"
                maxLength={50}
                value={values.lastName}
                error={errors.lastName}
                onChange={(event) => onChange('lastName', event.target.value)}
              />
            </div>
          )}

          <TextInput
            id={fieldIds.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            maxLength={120}
            label="Email address"
            placeholder="name@company.com"
            value={values.email}
            error={errors.email}
            onChange={(event) => onChange('email', event.target.value)}
          />

          <div>
            <label htmlFor={fieldIds.phone} className="mb-2 block text-sm font-semibold text-navy">
              Mobile number
              <RequiredMark />
            </label>
            <div
              className={`flex h-12 overflow-hidden rounded-xl border bg-white transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue ${
                errors.phone ? 'border-[#E0232E]' : 'border-ink/10 focus-within:border-green'
              }`}
            >
              <span className="flex items-center border-r border-ink/10 bg-ink/[0.03] px-3 text-sm font-semibold text-navy">
                +233
              </span>
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
                onChange={(event) => onChange('phone', phoneInput(event.target.value))}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink/35"
              />
            </div>
            <FieldMessage
              id={fieldIds.phone}
              error={errors.phone}
              hint="Ghana number, for example 024 123 4567. You can paste +233 as well."
            />
          </div>

          {business ? (
            <>
              <SectionLabel>Business</SectionLabel>
              <TextInput
                id={fieldIds.businessName}
                name="businessName"
                label="Business name"
                autoComplete="organization"
                maxLength={80}
                value={values.businessName}
                error={errors.businessName}
                onChange={(event) => onChange('businessName', event.target.value)}
              />
            </>
          ) : (
            <>
              <SectionLabel>Identity</SectionLabel>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <SelectInput
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
                  onChange={(event) => onChange('dateOfBirth', event.target.value)}
                />
              </div>
            </>
          )}

          <SectionLabel>Location</SectionLabel>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <SelectInput
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
            </SelectInput>
            <TextInput
              id={fieldIds.city}
              name="city"
              label="City"
              autoComplete="address-level2"
              maxLength={40}
              placeholder="Accra"
              value={values.city}
              error={errors.city}
              onChange={(event) => onChange('city', event.target.value)}
            />
          </div>
          <TextInput
            id={fieldIds.address}
            name="address"
            label={business ? 'Business address' : 'Address'}
            autoComplete="street-address"
            maxLength={120}
            placeholder="12 Ring Road"
            value={values.address}
            error={errors.address}
            onChange={(event) => onChange('address', event.target.value)}
          />

          <PhotoField
            id={fieldIds.profileImage}
            label={business ? 'Logo' : 'Profile photo'}
            file={values.profileImage}
            preview={preview}
            error={errors.profileImage}
            onSelect={(file) => onChange('profileImage', file)}
            onClear={() => onChange('profileImage', null)}
          />
        </div>
      ) : null}

      <div className="mt-2 flex flex-col-reverse gap-3 border-t border-ink/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onClear}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-semibold text-ink/60 hover:text-navy ${focusClass}`}
        >
          Clear form
        </button>
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-wait disabled:opacity-70 ${focusClass}`}
        >
          {submitting ? 'Onboarding client' : 'Onboard client'}
        </button>
      </div>
    </form>
  )
}
