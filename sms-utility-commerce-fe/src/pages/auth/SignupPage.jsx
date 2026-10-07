import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, Check, User } from 'lucide-react'
import { useId, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthShell } from '../../components/AuthShell'
import { GoogleButton } from '../../components/GoogleButton'
import { TextField } from '../../components/TextField'
import { setCredentials } from '../../features/auth/authSlice'
import { googleSession, signupSession } from '../../features/auth/session'
import { countryCode, emailPattern, toPhoneIdentifier } from '../../features/auth/validation'
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

const emptyValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  address: '',
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
                  <span className="block text-base font-semibold text-navy">{type.title}</span>
                  <span className="mt-0.5 block text-sm leading-5 text-ink/60">{type.text}</span>
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
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(20,115,230,0.7)] transition-all duration-200 hover:bg-[#0f64cf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99]"
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

function DetailsStep({ accountType, values, errors, onChange, onBack, onSubmit }) {
  const id = useId()
  const isBusiness = accountType === 'business'
  const type = accountTypes.find((item) => item.id === accountType)

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-1">
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

      <div className="grid gap-x-4 sm:grid-cols-2">
        <TextField
          id={`${id}-first`}
          name="firstName"
          label="First name"
          autoComplete="given-name"
          autoFocus
          value={values.firstName}
          error={errors.firstName}
          onChange={(event) => onChange('firstName', event.target.value)}
        />
        <TextField
          id={`${id}-last`}
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          value={values.lastName}
          error={errors.lastName}
          onChange={(event) => onChange('lastName', event.target.value)}
        />
      </div>

      <TextField
        id={`${id}-email`}
        name="email"
        type="email"
        inputMode="email"
        label="Email address"
        placeholder="you@example.com"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(event) => onChange('email', event.target.value)}
      />

      <TextField
        id={`${id}-phone`}
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
      />

      <AnimatePresence initial={false}>
        {isBusiness ? (
          <motion.div
            key="business"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="mt-1 mb-4 border-t border-ink/10 pt-5 text-xs font-semibold tracking-[0.14em] text-ink/45">
              BUSINESS DETAILS
            </p>
            <TextField
              id={`${id}-business`}
              name="businessName"
              label="Business name"
              autoComplete="organization"
              value={values.businessName}
              error={errors.businessName}
              onChange={(event) => onChange('businessName', event.target.value)}
            />
            <TextField
              id={`${id}-address`}
              name="address"
              label="Business address"
              placeholder="Street, area, city"
              autoComplete="street-address"
              value={values.address}
              error={errors.address}
              onChange={(event) => onChange('address', event.target.value)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="submit"
        className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(20,115,230,0.7)] transition-all duration-200 hover:bg-[#0f64cf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:scale-[0.99]"
      >
        Create account
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

function validate(accountType, values) {
  const errors = {}
  const trimmed = (key) => values[key].trim()

  if (trimmed('firstName').length < 2) errors.firstName = 'Enter your first name.'
  if (trimmed('lastName').length < 2) errors.lastName = 'Enter your last name.'
  if (!emailPattern.test(trimmed('email'))) errors.email = 'Enter a valid email address.'
  if (!toPhoneIdentifier(values.phone)) errors.phone = 'Enter a valid number, for example 024 123 4567.'

  if (accountType === 'business') {
    if (trimmed('businessName').length < 2) errors.businessName = 'Enter your business name.'
    if (trimmed('address').length < 5) errors.address = 'Enter your business address.'
  }

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
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  function createAccount(event) {
    event.preventDefault()

    const found = validate(accountType, values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    dispatch(
      setCredentials(
        signupSession({
          accountType,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: toPhoneIdentifier(values.phone),
          businessName: values.businessName.trim(),
          address: values.address.trim(),
        }),
      ),
    )
    navigate(paths.verify, { replace: true, state: { from: returnTo } })
  }

  const isDetails = step === 1

  return (
    <AuthShell
      eyebrow={<Stepper current={step} />}
      title={isDetails ? 'Tell us about you' : 'Create your account'}
      subtitle={
        isDetails
          ? accountType === 'business'
            ? 'Your details and your business. We confirm your email with a code before you enter the app.'
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
