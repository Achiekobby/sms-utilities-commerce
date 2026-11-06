import { useEffect, useRef, useState } from 'react'
import { usePermissions } from '../../../features/auth/usePermissions'
import {
  emptyClient,
  onboardingErrors,
  onboardBody,
  photoError,
  validateClient,
} from '../../../features/onboarding/clientOnboarding'
import { useNotify } from '../../../features/notifications/useNotify'
import { useOnboardClientMutation } from '../../../services/api/onboarding/onboardingApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { OnboardingForm } from './OnboardingForm'
import { OnboardingGuide } from './OnboardingGuide'
import { OnboardingSuccess } from './OnboardingSuccess'

export function ClientOnboardingPage() {
  const access = usePermissions()
  const notify = useNotify()
  const [onboardClient, { isLoading }] = useOnboardClientMutation()
  const [accountType, setAccountType] = useState('')
  const [values, setValues] = useState(emptyClient)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [focusToken, setFocusToken] = useState(0)
  const [preview, setPreview] = useState('')
  const [created, setCreated] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const previewRef = useRef('')

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  if (!access.hasPermission('onboarding.client')) return <AccessDeniedPage />

  function replacePreview(file) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = file instanceof File ? URL.createObjectURL(file) : ''
    previewRef.current = url
    setPreview(url)
  }

  function change(key, value) {
    setFormError('')
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
    if (key !== 'profileImage') {
      setValues((current) => ({ ...current, [key]: value }))
      return
    }
    replacePreview(value)
    setValues((current) => ({ ...current, profileImage: value }))
    const photo = photoError(value)
    if (photo) setErrors((current) => ({ ...current, profileImage: photo }))
  }

  function chooseType(next) {
    setAccountType(next)
    setErrors({})
    setFormError('')
  }

  function clearForm() {
    replacePreview(null)
    setValues(emptyClient)
    setErrors({})
    setFormError('')
    setAttempt(0)
  }

  function onboardAnother() {
    clearForm()
    setCreated(null)
    setSuccessMessage('')
    setFocusToken((token) => token + 1)
  }

  async function submit(event) {
    event.preventDefault()
    if (isLoading) return

    const found = validateClient(accountType, values)
    if (Object.keys(found).length) {
      setErrors(found)
      setFormError('')
      setAttempt((count) => count + 1)
      return
    }

    try {
      const result = await onboardClient(onboardBody(accountType, values)).unwrap()
      const message = result?.message || 'Client onboarded. OTP sent to their email.'
      const data = result?.data
      setCreated(data && typeof data === 'object' && !Array.isArray(data) ? data : {})
      setSuccessMessage(message)
      clearForm()
      notify.success(message)
    } catch (error) {
      const parsed = onboardingErrors(error)
      setErrors(parsed.fields)
      setFormError(parsed.formError)
      setAttempt((count) => count + 1)
      if (parsed.formError) notify.error(parsed.formError)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-6xl">
      <header>
        <p className="text-sm font-medium text-ink/50">Customers</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Onboard a client</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Create an individual or business account. We email them a one-time code so they can finish signing in.
        </p>
      </header>

      {created ? (
        <div className="mt-6">
          <OnboardingSuccess client={created} message={successMessage} onAnother={onboardAnother} />
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-stretch">
          <div className="min-w-0 xl:self-start">
            <OnboardingForm
              accountType={accountType}
              values={values}
              errors={errors}
              formError={formError}
              attempt={attempt}
              focusToken={focusToken}
              submitting={isLoading}
              preview={preview}
              onType={chooseType}
              onChange={change}
              onSubmit={submit}
              onClear={clearForm}
            />
          </div>
          <div className="min-w-0">
            <OnboardingGuide
              accountType={accountType}
              values={values}
              className="xl:sticky xl:top-[4.25rem] xl:z-10 xl:max-h-[calc(100svh-5.75rem)] xl:overflow-y-auto xl:overscroll-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
