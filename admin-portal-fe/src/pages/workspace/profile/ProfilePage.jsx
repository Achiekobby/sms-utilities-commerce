import { UserRound } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router'
import { applyProfile } from '../../../features/auth/authSlice'
import { adminFromProfile, apiErrorMessage, fieldErrors } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import { usePermissions } from '../../../features/auth/usePermissions'
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../services/api/profile/profileApi'
import Images from '../../../utils/Images'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { formFromProfile, isProfileDirty, profileBody, validateProfile } from './profileForm'
import { AccountDetails } from './settings/AccountDetails'
import { PermissionsSettings } from './settings/PermissionsSettings'
import { PersonalInformation } from './settings/PersonalInformation'
import { ProfileHeader } from './settings/ProfileHeader'
import { ProfileSidebar } from './settings/ProfileSidebar'
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
    <div className="flex w-full min-w-0 flex-col">
      <header className="relative shrink-0 overflow-hidden rounded-2xl border border-ink/[0.06] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)] sm:px-6 sm:py-5">
        <img
          src={Images.profile_header_background}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="relative flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-green shadow-[0_8px_20px_-14px_rgba(0,136,89,0.9)] ring-1 ring-green/15">
            <UserRound size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Admin account</p>
            <h1 className="mt-0.5 text-[1.75rem] leading-none font-bold tracking-tight text-navy">Profile</h1>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">
              Your photo, contact details, and the access on this account.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <ProfileSidebar section={section} onSelect={openSection} />

        <div className="min-w-0 w-full flex-1">
          {isError ? (
            <div className="mb-5 rounded-2xl border border-[#E0232E]/20 bg-white px-4 py-4" role="alert">
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
          <div className="profile-in flex flex-col gap-5">
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
            {profile && section === 'permissions' ? <PermissionsSettings profile={profile} /> : null}
          </div>
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
