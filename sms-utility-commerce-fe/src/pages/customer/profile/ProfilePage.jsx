import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateProfile } from '../../../features/auth/authSlice'
import { useAuth } from '../../../utils/hooks/useAuth'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { isProfileDirty, profileFromUser, profilePayload, validateProfile } from './profileModel'
import { ProfileForm } from './sections/ProfileForm'
import { ProfileIdentity } from './sections/ProfileIdentity'

export function ProfilePage() {
  useDocumentTitle('Profile')
  const dispatch = useDispatch()
  const { user, isBusiness, isVerified } = useAuth()
  const saved = useMemo(() => profileFromUser(user), [user])
  const [values, setValues] = useState(saved)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [attempt, setAttempt] = useState(0)
  const summaryRef = useRef(null)
  const baseId = useId()

  const fieldIds = {
    firstName: `${baseId}-first`,
    lastName: `${baseId}-last`,
    email: `${baseId}-email`,
    phone: `${baseId}-phone`,
    businessName: `${baseId}-business`,
    address: `${baseId}-address`,
  }

  const dirty = isProfileDirty(values, saved, isBusiness)

  useEffect(() => {
    if (!attempt) return
    summaryRef.current?.focus()
  }, [attempt])

  function changeValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setStatus('')
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  function blurField(key, value) {
    const found = validateProfile(isBusiness, { ...values, [key]: value })
    setErrors((current) => ({ ...current, [key]: found[key] }))
  }

  function discard() {
    setValues(saved)
    setErrors({})
    setStatus('')
    setAttempt(0)
  }

  function save(event) {
    event.preventDefault()
    const found = validateProfile(isBusiness, values)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      setStatus('')
      setAttempt((count) => count + 1)
      return
    }

    const payload = profilePayload(isBusiness, values)
    dispatch(updateProfile(payload))
    setValues(profileFromUser({ ...user, ...payload }))
    setAttempt(0)
    setStatus('Saved. The workspace now uses these details.')
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">Profile</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          {isBusiness
            ? 'The person on this account, and the business customers and sender IDs use.'
            : 'The name, email, and mobile number on your messages, receipts, and wallet.'}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 lg:w-64">
          <ProfileIdentity user={user} isVerified={isVerified} />
        </div>
        <div className="min-w-0 w-full flex-1">
          <ProfileForm
            isBusiness={isBusiness}
            values={values}
            errors={errors}
            fieldIds={fieldIds}
            dirty={dirty}
            status={status}
            summaryRef={summaryRef}
            showSummary={attempt > 0}
            onChange={changeValue}
            onBlur={blurField}
            onDiscard={discard}
            onSubmit={save}
          />
        </div>
      </div>
    </div>
  )
}
