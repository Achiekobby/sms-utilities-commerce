import { useEffect, useId, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router'
import { applyProfile } from '../../../features/auth/authSlice'
import { adminFromProfile, apiErrorMessage, fieldErrors } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import { usePermissions } from '../../../features/auth/usePermissions'
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../services/api/profile/profileApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { formFromProfile, isProfileDirty, profileBody, validateProfile } from './profileForm'
import { AccountDetails } from './settings/AccountDetails'
import { NotificationSettings } from './settings/NotificationSettings'
import { PermissionsSettings } from './settings/PermissionsSettings'
import { PersonalInformation } from './settings/PersonalInformation'
import { PreferenceSettings } from './settings/PreferenceSettings'
import { ProfileHeader } from './settings/ProfileHeader'
import { ProfileSidebar } from './settings/ProfileSidebar'
import { SecuritySettings } from './settings/SecuritySettings'
import { settingsSection } from './settings/sections'
import { focusClass } from './settings/ui'

export function ProfilePage() {
  const access = usePermissions()
  const dispatch = useDispatch()
  const notify = useNotify()
  const baseId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const section = settingsSection(searchParams.get('section'))
  const { data, isLoading, isFetching, isError, error, refetch } = useGetProfileQuery()
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const profile = data?.data
  const [values, setValues] = useState(null)
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState('')
  const previewRef = useRef('')

  if (profile && !values) setValues(formFromProfile(profile))

  useEffect(() => {
    if (!profile) return undefined
    const user = adminFromProfile(profile)
    if (user) dispatch(applyProfile(user))
    return undefined
  }, [dispatch, profile])

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function setPhoto(file) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = file instanceof File ? URL.createObjectURL(file) : ''
    previewRef.current = url
    setPreview(url)
    change('photo', file)
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!values || saving) return
    const nextErrors = validateProfile(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      const result = await updateProfile(profileBody(values)).unwrap()
      const user = adminFromProfile(result.data)
      if (user) dispatch(applyProfile(user))
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
      previewRef.current = ''
      setPreview(result.data?.profile_image || '')
      setValues(formFromProfile(result.data ?? profile))
      notify.success(result.message || 'Profile updated.')
    } catch (saveError) {
      const fields = fieldErrors(saveError)
      setErrors(fields)
      if (!Object.keys(fields).length) notify.error(apiErrorMessage(saveError))
    }
  }

  if (!access.hasPermission('profile.manage')) return <AccessDeniedPage />

  const saved = profile ? formFromProfile(profile) : null
  const dirty = values ? isProfileDirty(values, saved) : false
  const photoUrl = preview || profile?.profile_image || ''
  const waiting = !profile && (isLoading || isFetching) && !isError

  function openSection(next) {
    setSearchParams(next === 'profile' ? {} : { section: next }, { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-[72rem]">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Settings</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Your admin profile, sign-in, and the choices stored in this browser.
        </p>
      </header>

      {isError ? (
        <div className="mt-6 rounded-xl border border-[#E0232E]/20 bg-white px-4 py-4" role="alert">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
          <button
            type="button"
            onClick={refetch}
            className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
          >
            Try again
          </button>
        </div>
      ) : null}

      <div className="profile-in mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <ProfileSidebar section={section} onSelect={openSection} />
        <div className="min-w-0 w-full flex-1">
          {waiting ? <ProfileSkeleton /> : null}
          {profile && values && section === 'profile' ? (
            <div className="flex flex-col gap-4">
              <ProfileHeader
                profile={profile}
                photo={photoUrl}
                pendingFile={values.photo instanceof File}
                photoError={errors.profileImage}
                onSelect={setPhoto}
                onClear={() => setPhoto(null)}
              />
              <PersonalInformation
                baseId={baseId}
                values={values}
                errors={errors}
                dirty={dirty}
                saving={saving}
                onChange={change}
                onSubmit={onSubmit}
              />
            </div>
          ) : null}
          {profile && section === 'account' ? <AccountDetails profile={profile} /> : null}
          {profile && section === 'security' ? <SecuritySettings profile={profile} /> : null}
          {profile && section === 'permissions' ? <PermissionsSettings profile={profile} /> : null}
          {section === 'notifications' ? <NotificationSettings /> : null}
          {section === 'preferences' ? <PreferenceSettings /> : null}
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/[0.08] bg-white p-6" aria-hidden="true">
      <div className="flex gap-5">
        <div className="skeleton size-20 rounded-full" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="skeleton h-6 w-40 rounded-md" />
          <div className="skeleton h-4 w-56 rounded-md" />
        </div>
      </div>
    </div>
  )
}
