import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router'
import { applyProfile } from '../../../features/auth/authSlice'
import { apiErrorMessage, clientFromApi, fieldErrors, profileBody } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../services/api/auth/authApi'
import { useAuth } from '../../../utils/hooks/useAuth'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { isProfileDirty, profileFromUser, validateProfile } from './profileModel'
import { AccountDetails } from './settings/AccountDetails'
import { NotificationSettings } from './settings/NotificationSettings'
import { PreferenceSettings } from './settings/PreferenceSettings'
import { ProfileHeader } from './settings/ProfileHeader'
import { ProfileSidebar } from './settings/ProfileSidebar'
import { SecuritySettings } from './settings/SecuritySettings'
import { settingsSection } from './settings/sections'
import { ProfileForm } from './sections/ProfileForm'
import { ProfileSkeleton } from './sections/ProfileSkeleton'

export function ProfilePage() {
  useDocumentTitle('Profile')
  const dispatch = useDispatch()
  const notify = useNotify()
  const [searchParams, setSearchParams] = useSearchParams()
  const section = settingsSection(searchParams.get('section'))
  const { user, isBusiness, isVerified } = useAuth()
  const { data: profile, isLoading, isFetching, isError, error, refetch } = useGetProfileQuery()
  const [saveProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const saved = useMemo(() => profileFromUser(user), [user])
  const [values, setValues] = useState(saved)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const summaryRef = useRef(null)
  const edited = useRef(false)
  const photoUrlRef = useRef('')
  const baseId = useId()

  const fieldIds = {
    firstName: `${baseId}-first`,
    lastName: `${baseId}-last`,
    email: `${baseId}-email`,
    phone: `${baseId}-phone`,
    gender: `${baseId}-gender`,
    dateOfBirth: `${baseId}-dob`,
    region: `${baseId}-region`,
    city: `${baseId}-city`,
    businessName: `${baseId}-business`,
    address: `${baseId}-address`,
    profileImage: `${baseId}-photo`,
  }

  const dirty = isProfileDirty(values, saved, isBusiness) || values.profileImage instanceof File
  const waitingForProfile = !profile && (isLoading || isFetching) && !isError
  const showSkeleton = saving || waitingForProfile

  useEffect(() => {
    if (profile) dispatch(applyProfile(profile))
  }, [dispatch, profile])

  useEffect(() => {
    if (edited.current) return
    setValues(saved)
  }, [saved])

  useEffect(() => {
    if (!attempt) return
    summaryRef.current?.focus()
  }, [attempt])

  function clearPhoto() {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
    photoUrlRef.current = ''
  }

  function changeValue(key, value) {
    edited.current = true
    setFormError('')
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))

    if (key !== 'profileImage') {
      setValues((current) => ({ ...current, [key]: value }))
      return
    }

    clearPhoto()
    const photoUrl = value ? URL.createObjectURL(value) : ''
    photoUrlRef.current = photoUrl
    setValues((current) => ({ ...current, profileImage: value, photoUrl }))
  }

  function blurField(key, value) {
    const found = validateProfile(isBusiness, { ...values, [key]: value })
    setErrors((current) => ({ ...current, [key]: found[key] }))
  }

  function discard() {
    edited.current = false
    clearPhoto()
    setValues(saved)
    setErrors({})
    setFormError('')
    setAttempt(0)
  }

  async function save(event) {
    event.preventDefault()
    const found = validateProfile(isBusiness, values)
    setErrors(found)
    setFormError('')

    if (Object.keys(found).length > 0) {
      setAttempt((count) => count + 1)
      return
    }

    try {
      const result = await saveProfile(profileBody(isBusiness, values)).unwrap()
      const returned = result?.data
      const next = returned && typeof returned === 'object' && (returned.email || returned.id)
        ? clientFromApi(returned)
        : null
      edited.current = false
      clearPhoto()
      if (next) dispatch(applyProfile(next))
      setValues({
        ...profileFromUser(next ?? user),
        ...(next
          ? {}
          : {
              businessName: values.businessName.trim(),
              firstName: values.firstName.trim(),
              lastName: values.lastName.trim(),
              email: values.email.trim().toLowerCase(),
              phone: values.phone,
              gender: values.gender,
              dateOfBirth: values.dateOfBirth,
              region: values.region,
              city: values.city.trim(),
              address: values.address.trim(),
            }),
        profileImage: null,
        photoUrl: '',
      })
      const message = typeof result?.message === 'string' && result.message.length < 80 ? result.message : 'Profile updated.'
      setAttempt(0)
      notify.success(message)
    } catch (saveError) {
      const fields = fieldErrors(saveError)
      setErrors(fields)
      setFormError(Object.keys(fields).length > 0 ? '' : apiErrorMessage(saveError))
      if (Object.keys(fields).length > 0) setAttempt((count) => count + 1)
    }
  }

  function openSection(next) {
    setSearchParams(next === 'profile' ? {} : { section: next }, { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-[72rem]">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Settings</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          {isBusiness
            ? 'The business on this account, and how you sign in.'
            : 'Your profile, sign-in, and the choices stored in this browser.'}
        </p>
      </header>

      {isError ? (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Try again
          </button>
        </div>
      ) : null}

      {showSkeleton ? (
        <ProfileSkeleton
          isBusiness={isBusiness}
          label={saving ? 'Saving your profile' : 'Loading your profile'}
        />
      ) : (
        <div className="profile-in mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          <ProfileSidebar section={section} onSelect={openSection} />
          <div className="min-w-0 w-full flex-1">
            {section === 'profile' ? (
              <div className="flex flex-col gap-4">
                <ProfileHeader
                  user={user}
                  isVerified={isVerified}
                  photo={values.photoUrl || user?.profileImage || ''}
                  pendingFile={values.profileImage instanceof File}
                  photoError={errors.profileImage}
                  onSelect={(file) => changeValue('profileImage', file)}
                  onClear={() => changeValue('profileImage', null)}
                />
                <ProfileForm
                  isBusiness={isBusiness}
                  values={values}
                  errors={errors}
                  fieldIds={fieldIds}
                  dirty={dirty}
                  summaryRef={summaryRef}
                  showSummary={attempt > 0}
                  onChange={changeValue}
                  onBlur={blurField}
                  onDiscard={discard}
                  onSubmit={save}
                  submitting={saving}
                  formError={formError}
                  currentPhoto={user?.profileImage || ''}
                  hidePhoto
                />
              </div>
            ) : null}
            {section === 'account' ? <AccountDetails user={user} isVerified={isVerified} /> : null}
            {section === 'security' ? <SecuritySettings user={user} /> : null}
            {section === 'notifications' ? <NotificationSettings /> : null}
            {section === 'preferences' ? <PreferenceSettings /> : null}
          </div>
        </div>
      )}
    </div>
  )
}
