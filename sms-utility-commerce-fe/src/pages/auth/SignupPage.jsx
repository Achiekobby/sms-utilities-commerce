import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, Check, ImagePlus, User, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthShell } from '../../components/AuthShell'
import { GoogleButton } from '../../components/GoogleButton'
import { SelectField } from '../../components/SelectField'
import { TextField } from '../../components/TextField'
import { beginVerification, setCredentials } from '../../features/auth/authSlice'
import { apiErrorMessage, fieldErrors, signupBody, verificationFrom } from '../../features/auth/client'
import { googleSession } from '../../features/auth/session'
import { genders, ghanaRegions } from '../../features/auth/regions'
import { countryCode, emailPattern, toPhoneIdentifier } from '../../features/auth/validation'
import { useSignupMutation } from '../../services/api/auth/authApi'
import { paths, safeCustomerReturn } from '../../routes/paths'
import Images from '../../utils/Images'

const errorColor = '#E0232E'
const ease = [0.22, 1, 0.36, 1]

const accountTypes = [
  {
    id: 'individual',
    title: 'Individual',
    text: 'Message your own contacts and pay for airtime, data and bills.',
    icon: User,
  },
  {
    id: 'business',
    title: 'Business',
    text: 'Run campaigns for a team, with your own sender IDs and shared access.',
    icon: Building2,
  },
]

const steps = ['Account type', 'Your details', 'Verify']

const photoTypes = ['image/jpeg', 'image/png', 'image/webp']
const photoMaxBytes = 2 * 1024 * 1024

const individualFields = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['email', 'Email address'],
  ['phone', 'Mobile number'],
  ['gender', 'Gender'],
  ['dateOfBirth', 'Date of birth'],
  ['region', 'Region'],
  ['city', 'City'],
  ['address', 'Address'],
  ['profileImage', 'Profile photo'],
]

const emptyValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  region: '',
  city: '',
  address: '',
  businessName: '',
  profileImage: null,
  photoUrl: '',
}

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-3" aria-label="Sign up progress">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current

        return (
          <li
            key={label}
            className="flex-1"
            aria-current={active ? 'step' : undefined}
          >
            <span className="block h-1 overflow-hidden rounded-full bg-ink/10">
              <motion.span
                className="block h-full origin-left rounded-full bg-blue"
                initial={false}
                animate={{ scaleX: done || active ? 1 : 0 }}
                transition={{ duration: 0.45, ease }}
              />
            </span>
            <span
              className={`mt-2 block text-xs font-medium transition-colors duration-300 ${
                active ? 'text-navy' : done ? 'text-ink/60' : 'text-ink/35'
              }`}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function AccountTypeStep({ accountType, error, onSelect, onContinue, onGoogle, returnTo }) {
  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="sr-only">Account type</legend>
        <div className="grid gap-3">
          {accountTypes.map((type) => {
            const Icon = type.icon

            return (
              <label
                key={type.id}
                className="group relative flex cursor-pointer items-start gap-4 rounded-xl border-2 border-ink/12 bg-white p-4 transition-all duration-200 hover:border-blue/40 has-[:checked]:border-blue has-[:checked]:bg-blue/[0.04] has-[:checked]:ring-4 has-[:checked]:ring-blue/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue"
              >
                <input
                  type="radio"
                  name="accountType"
                  value={type.id}
                  checked={accountType === type.id}
                  onChange={() => onSelect(type.id)}
                  className="sr-only"
                />
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-ink/[0.06] text-navy transition-colors duration-200 group-has-[:checked]:bg-blue group-has-[:checked]:text-white">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-navy">{type.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-5 text-ink/60">{type.text}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-ink/20 text-white transition-all duration-200 group-has-[:checked]:border-blue group-has-[:checked]:bg-blue"
                >
                  <Check
                    size={12}
                    strokeWidth={3.5}
                    className="scale-50 opacity-0 transition-all duration-200 group-has-[:checked]:scale-100 group-has-[:checked]:opacity-100"
                  />
                </span>
              </label>
            )
          })}
        </div>
        <p role="alert" className="mt-2 min-h-5 text-sm" style={{ color: errorColor }}>
          {error}
        </p>
      </fieldset>

      <button
        type="button"
        onClick={onContinue}
        className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-green text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,136,89,0.65)] transition-all duration-200 hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99]"
      >
        Continue
        <ArrowRight
          size={16}
          strokeWidth={2.4}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>

      <div className="flex items-center gap-4" role="separator" aria-label="or">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-xs font-medium tracking-wide text-ink/45">OR</span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <GoogleButton intent="signup" onClick={onGoogle} />

      <p className="text-center text-sm text-ink/65">
        Already have an account?{' '}
        <Link to={paths.login} state={{ from: returnTo }} className="font-semibold text-blue">
          Sign in
        </Link>
      </p>
    </div>
  )
}

const businessFields = [
  ['email', 'Email address'],
  ['phone', 'Mobile number'],
  ['businessName', 'Business name'],
  ['region', 'Region'],
  ['city', 'City'],
  ['address', 'Business address'],
  ['profileImage', 'Logo'],
]

function ErrorSummary({ summaryRef, errors, formError, fieldIds, isIndividual }) {
  const items = (isIndividual ? individualFields : businessFields).filter(([key]) => errors[key])

  if (items.length === 0 && !formError) return null

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="signup-error-title"
      className="mb-4 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 focus:outline-2 focus:outline-offset-2 focus:outline-blue"
    >
      <h2 id="signup-error-title" className="text-sm font-semibold" style={{ color: errorColor }}>
        Check these details
      </h2>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {items.map(([key, label]) => (
            <li key={key}>
              <a href={`#${fieldIds[key]}`} className="text-sm underline underline-offset-2" style={{ color: errorColor }}>
                {label}: {errors[key]}
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

function PhotoField({ id, file, preview, error, onSelect, onClear, label = 'Profile photo' }) {
  return (
    <div>
      <span id={`${id}-label`} className="mb-1.5 block text-[13px] font-medium text-navy">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <label
          htmlFor={id}
          className="relative flex h-10 min-w-0 flex-1 cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-ink/15 bg-white px-3 transition-all duration-200 hover:border-blue/40 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15"
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
              {file ? file.name : 'Add a photo'}
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
      <p id={`${id}-error`} role="alert" className="mt-1.5 min-h-4 text-[13px]" style={{ color: errorColor }}>
        {error}
      </p>
    </div>
  )
}

function RegionCityFields({ fieldIds, values, errors, onChange }) {
  return (
    <div className="grid gap-x-4 sm:grid-cols-2">
      <SelectField
        id={fieldIds.region}
        label="Region"
        dense
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
      <TextField
        id={fieldIds.city}
        name="city"
        label="City"
        autoComplete="address-level2"
        dense
        value={values.city}
        error={errors.city}
        onChange={(event) => onChange('city', event.target.value)}
      />
    </div>
  )
}

function DetailsStep({
  accountType,
  values,
  errors,
  formError,
  attempt,
  submitting,
  onChange,
  onBack,
  onSubmit,
}) {
  const id = useId()
  const summaryRef = useRef(null)
  const isBusiness = accountType === 'business'
  const type = accountTypes.find((item) => item.id === accountType)
  const fieldIds = {
    firstName: `${id}-first`,
    lastName: `${id}-last`,
    email: `${id}-email`,
    phone: `${id}-phone`,
    gender: `${id}-gender`,
    dateOfBirth: `${id}-dob`,
    region: `${id}-region`,
    city: `${id}-city`,
    address: `${id}-address`,
    businessName: `${id}-business`,
    profileImage: `${id}-photo`,
  }

  useEffect(() => {
    if (!attempt) return
    summaryRef.current?.focus()
  }, [attempt])

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-1">
      {attempt > 0 ? (
        <ErrorSummary
          summaryRef={summaryRef}
          errors={errors}
          formError={formError}
          fieldIds={fieldIds}
          isIndividual={!isBusiness}
        />
      ) : null}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-ink/[0.04] px-4 py-3">
        <p className="text-sm text-ink/65">
          Signing up as <span className="font-semibold text-navy">{type?.title}</span>
        </p>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <ArrowLeft size={14} strokeWidth={2.4} aria-hidden="true" />
          Change
        </button>
      </div>

      {isBusiness ? null : (
        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextField
            id={fieldIds.firstName}
            name="firstName"
            label="First name"
            autoComplete="given-name"
            autoFocus
            dense
            value={values.firstName}
            error={errors.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
          />
          <TextField
            id={fieldIds.lastName}
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            dense
            value={values.lastName}
            error={errors.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
          />
        </div>
      )}

      <TextField
        id={fieldIds.email}
        name="email"
        type="email"
        inputMode="email"
        label="Email address"
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus={isBusiness}
        dense
        value={values.email}
        error={errors.email}
        onChange={(event) => onChange('email', event.target.value)}
      />

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
        dense
        value={values.phone}
        error={errors.phone}
        onChange={(event) => onChange('phone', event.target.value.replace(/[^\d\s]/g, ''))}
      />

      {isBusiness ? (
          <div>
            <p className="mt-1 mb-4 border-t border-ink/10 pt-5 text-xs font-semibold tracking-[0.14em] text-ink/45">
              BUSINESS DETAILS
            </p>
            <TextField
              id={fieldIds.businessName}
              name="businessName"
              label="Business name"
              autoComplete="organization"
              dense
              value={values.businessName}
              error={errors.businessName}
              onChange={(event) => onChange('businessName', event.target.value)}
            />
            <RegionCityFields fieldIds={fieldIds} values={values} errors={errors} onChange={onChange} />
            <TextField
              id={fieldIds.address}
              name="address"
              label="Business address"
              placeholder="Street and area"
              autoComplete="street-address"
              dense
              value={values.address}
              error={errors.address}
              onChange={(event) => onChange('address', event.target.value)}
            />
            <PhotoField
              id={fieldIds.profileImage}
              label="Logo"
              file={values.profileImage}
              preview={values.photoUrl}
              error={errors.profileImage}
              onSelect={(file) => onChange('profileImage', file)}
              onClear={() => onChange('profileImage', null)}
            />
          </div>
        ) : (
          <div>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <SelectField
                id={fieldIds.gender}
                label="Gender"
                dense
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
              <TextField
                id={fieldIds.dateOfBirth}
                name="dateOfBirth"
                type="date"
                label="Date of birth"
                autoComplete="bday"
                dense
                max={todayIso()}
                value={values.dateOfBirth}
                error={errors.dateOfBirth}
                onChange={(event) => onChange('dateOfBirth', event.target.value)}
              />
            </div>
            <RegionCityFields fieldIds={fieldIds} values={values} errors={errors} onChange={onChange} />
            <TextField
              id={fieldIds.address}
              name="address"
              label="Address"
              placeholder="Street and area"
              dense
              autoComplete="street-address"
              value={values.address}
              error={errors.address}
              onChange={(event) => onChange('address', event.target.value)}
            />
            <PhotoField
              id={fieldIds.profileImage}
              file={values.profileImage}
              preview={values.photoUrl}
              error={errors.profileImage}
              onSelect={(file) => onChange('profileImage', file)}
              onClear={() => onChange('profileImage', null)}
            />
          </div>
        )}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="group mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-green text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,136,89,0.65)] transition-all duration-200 hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? 'Creating account' : 'Create account'}
        <ArrowRight
          size={16}
          strokeWidth={2.4}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-ink/50">
        We will send a 6-digit code to your email. By continuing, you agree to our{' '}
        <Link to={paths.terms} className="underline underline-offset-2 hover:text-blue">
          Terms
        </Link>
        .
      </p>
    </form>
  )
}

function photoError(photo) {
  if (!photo) return ''
  if (!photoTypes.includes(photo.type)) return 'Use a JPG, PNG, or WebP photo.'
  if (photo.size > photoMaxBytes) return 'Use a photo smaller than 2 MB.'
  return ''
}

function validate(accountType, values) {
  const errors = {}
  const trimmed = (key) => values[key].trim()
  const isBusiness = accountType === 'business'

  if (!isBusiness) {
    if (trimmed('firstName').length < 2) errors.firstName = 'Enter your first name.'
    if (trimmed('lastName').length < 2) errors.lastName = 'Enter your last name.'
  }
  if (!emailPattern.test(trimmed('email'))) errors.email = 'Enter a valid email address.'
  if (!toPhoneIdentifier(values.phone)) errors.phone = 'Enter a valid number, for example 024 123 4567.'

  if (isBusiness) {
    if (trimmed('businessName').length < 2) errors.businessName = 'Enter your business name.'
  } else {
    if (!values.gender) errors.gender = 'Select a gender.'
    if (!values.dateOfBirth) errors.dateOfBirth = 'Enter your date of birth.'
    else if (values.dateOfBirth > todayIso()) errors.dateOfBirth = 'Enter a date of birth that is not in the future.'
  }

  if (!values.region) errors.region = 'Select your region.'
  if (trimmed('city').length < 2) errors.city = 'Enter your city.'
  if (trimmed('address').length < 5) {
    errors.address = isBusiness ? 'Enter your business address.' : 'Enter your address.'
  }

  const photo = photoError(values.profileImage)
  if (photo) errors.profileImage = photo

  return errors
}

export function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.from
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [accountType, setAccountType] = useState('')
  const [typeError, setTypeError] = useState('')
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [signup, { isLoading }] = useSignupMutation()
  const photoUrlRef = useRef('')

  function go(next) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  function chooseType(id) {
    setAccountType(id)
    setTypeError('')
  }

  function continueToDetails() {
    if (!accountType) {
      setTypeError('Choose how you will use the platform.')
      return
    }
    go(1)
  }

  function continueWithGoogle() {
    if (!accountType) {
      setTypeError('Choose an account type first.')
      return
    }
    dispatch(setCredentials(googleSession({ accountType })))
    navigate(safeCustomerReturn(returnTo), { replace: true })
  }

  function changeValue(key, value) {
    setFormError('')
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))

    if (key !== 'profileImage') {
      setValues((current) => ({ ...current, [key]: value }))
      return
    }

    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
    const photoUrl = value ? URL.createObjectURL(value) : ''
    photoUrlRef.current = photoUrl
    setValues((current) => ({
      ...current,
      profileImage: value,
      photoUrl,
    }))
  }

  async function createAccount(event) {
    event.preventDefault()

    const found = validate(accountType, values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setFormError('')
      setAttempt((count) => count + 1)
      return
    }

    try {
      const result = await signup(signupBody(accountType, values)).unwrap()
      dispatch(beginVerification(verificationFrom(result.data, 'registration', values.email.trim().toLowerCase())))
      navigate(paths.verify, { replace: true, state: { from: returnTo } })
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors(fields)
      setFormError(Object.keys(fields).length > 0 ? '' : apiErrorMessage(error))
      setAttempt((count) => count + 1)
    }
  }

  const isDetails = step === 1

  return (
    <AuthShell
      dense
      eyebrow={<Stepper current={step} />}
      title={isDetails ? 'Tell us about you' : 'Create your account'}
      subtitle={
        isDetails
          ? accountType === 'business'
            ? 'Your business details. We confirm your email with a code before you enter the app.'
            : 'Your details are used to set up your wallet. We confirm your email with a code before you enter the app.'
          : 'First, how will you use the platform? You can run campaigns, fund a wallet, and buy utilities either way.'
      }
      image={Images.auth}
      caption={{
        title: 'Start sending in minutes.',
        text: 'Fund your wallet, upload contacts, and reach everyone from one place.',
      }}
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.25, ease }}
        >
          {isDetails ? (
            <DetailsStep
              accountType={accountType}
              values={values}
              errors={errors}
              formError={formError}
              attempt={attempt}
              submitting={isLoading}
              onChange={changeValue}
              onBack={() => go(0)}
              onSubmit={createAccount}
            />
          ) : (
            <AccountTypeStep
              accountType={accountType}
              error={typeError}
              onSelect={chooseType}
              onContinue={continueToDetails}
              onGoogle={continueWithGoogle}
              returnTo={returnTo}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  )
}
