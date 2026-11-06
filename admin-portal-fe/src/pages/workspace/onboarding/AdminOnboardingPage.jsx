import { CircleCheck, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { adminFieldErrors, adminName, emptyAdmin, onboardAdminBody, validateAdmin } from '../../../features/admins/adminModel'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { useNotify } from '../../../features/notifications/useNotify'
import { formatPhone, formatWhen, photoError } from '../../../features/onboarding/clientOnboarding'
import { paths } from '../../../routes/paths'
import { useOnboardAdminMutation } from '../../../services/api/onboarding/onboardingApi'
import { useGetRolesQuery } from '../../../services/api/roles/rolesApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { AdminFields } from '../admins/AdminFields'
import { cardClass, focusClass } from './ui'

export function AdminOnboardingPage() {
  const access = usePermissions()
  const notify = useNotify()
  const allowed = access.hasPermission('onboarding.admin')
  const canManage = access.hasPermission('admin.manage')
  const canManageRoles = access.hasPermission('role.manage')
  const [onboardAdmin, { isLoading }] = useOnboardAdminMutation()
  const rolesQuery = useGetRolesQuery({ page: 1, perPage: 100 }, { skip: !allowed })
  const roles = Array.isArray(rolesQuery.data?.data) ? rolesQuery.data.data : []
  const [values, setValues] = useState(emptyAdmin)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [preview, setPreview] = useState('')
  const [created, setCreated] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const previewRef = useRef('')
  const formRef = useRef(null)

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  useEffect(() => {
    if (!attempt) return
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [attempt])

  if (!allowed) return <AccessDeniedPage />

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

  function clearForm() {
    replacePreview(null)
    setValues(emptyAdmin)
    setErrors({})
    setFormError('')
    setAttempt(0)
  }

  function onboardAnother() {
    clearForm()
    setCreated(null)
    setSuccessMessage('')
  }

  async function submit(event) {
    event.preventDefault()
    if (isLoading) return
    const found = validateAdmin(values, { requireRole: true })
    if (Object.keys(found).length) {
      setErrors(found)
      setFormError('')
      setAttempt((count) => count + 1)
      return
    }

    try {
      const result = await onboardAdmin(onboardAdminBody(values)).unwrap()
      const message = result?.message || 'Admin onboarded. OTP sent to their email.'
      const data = result?.data
      setCreated(data && typeof data === 'object' && !Array.isArray(data) ? data : {})
      setSuccessMessage(message)
      clearForm()
      notify.success(message)
    } catch (error) {
      const parsed = adminFieldErrors(error)
      setErrors(parsed.fields)
      setFormError(parsed.formError)
      setAttempt((count) => count + 1)
      if (parsed.formError) notify.error(parsed.formError)
    }
  }

  const rolesError = rolesQuery.isError ? apiErrorMessage(rolesQuery.error) : ''

  return (
    <div className="w-full min-w-0 max-w-6xl">
      <header>
        <p className="text-sm font-medium text-ink/50">Access & security</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Onboard an admin</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Create a teammate, assign their role, and email them a one-time code so they can sign in.
        </p>
      </header>

      {created ? (
        <div className="mt-6">
          <AdminSuccess admin={created} message={successMessage} canManage={canManage} onAnother={onboardAnother} />
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-stretch">
          <div className="min-w-0 xl:self-start">
            <form ref={formRef} onSubmit={submit} className={cardClass}>
              {formError ? (
                <p className="mb-5 rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-3.5 py-3 text-sm text-[#9F1C26]" role="alert">
                  {formError}
                </p>
              ) : null}
              <AdminFields
                values={values}
                errors={errors}
                onChange={change}
                preview={preview}
                showRole
                roles={roles}
                rolesLoading={rolesQuery.isLoading}
                rolesError={rolesError}
                onRetryRoles={rolesQuery.refetch}
                canManageRoles={canManageRoles}
              />
              {!rolesQuery.isLoading && !rolesError && !roles.length ? (
                <p className="mt-4 rounded-xl bg-[#FFF4DF] px-3.5 py-3 text-sm leading-5 text-[#9A5B00]">
                  Create a role before onboarding an admin.
                  {canManageRoles ? (
                    <>
                      {' '}
                      <Link to={paths.roles} className={`font-semibold text-navy underline ${focusClass}`}>
                        Open roles
                      </Link>
                    </>
                  ) : null}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading || rolesQuery.isLoading || Boolean(rolesError) || !roles.length}
                  aria-busy={isLoading}
                  className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
                >
                  {isLoading ? 'Onboarding admin' : 'Onboard admin'}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  disabled={isLoading}
                  className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-ink/10 px-4 text-sm font-semibold text-navy hover:border-green/40 disabled:opacity-50 ${focusClass}`}
                >
                  Clear form
                </button>
              </div>
            </form>
          </div>
          <div className="min-w-0">
            <OnboardingAside className="xl:sticky xl:top-[4.25rem] xl:z-10" />
          </div>
        </div>
      )}
    </div>
  )
}

function OnboardingAside({ className = '' }) {
  const facts = [
    { icon: UserRound, text: 'Name, email, and a Ghana mobile number are required.' },
    { icon: ShieldCheck, text: 'The role you choose is what they can do after they sign in.' },
    { icon: Mail, text: 'A one-time code is emailed so they can finish signing in.' },
  ]

  return (
    <aside className={`${cardClass} ${className}`.trim()}>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">What happens next</p>
      <h2 className="mt-1 text-lg font-bold tracking-tight text-navy">They finish sign-in by email</h2>
      <ul className="mt-4 space-y-3">
        {facts.map((fact) => {
          const Icon = fact.icon
          return (
            <li key={fact.text} className="flex items-start gap-3 text-sm leading-5 text-ink/70">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#E7F8F0] text-green">
                <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
              </span>
              {fact.text}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function AdminSuccess({ admin, message, canManage, onAnother }) {
  const name = adminName(admin)
  const expires = formatWhen(admin?.expires_at)
  const channel = admin?.channel === 'email' || !admin?.channel ? 'email' : admin.channel

  useEffect(() => {
    document.getElementById('admin-onboard-success')?.focus()
  }, [])

  return (
    <section className={cardClass} aria-labelledby="admin-onboard-success">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-green uppercase">
        <CircleCheck size={14} strokeWidth={2.2} aria-hidden="true" />
        Invitation sent
      </p>
      <h2 id="admin-onboard-success" tabIndex={-1} className="mt-1 text-2xl font-bold tracking-tight text-navy focus:outline-none">
        {name}
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink/65">{message}</p>
      <dl className="mt-6 grid gap-4 border-t border-ink/[0.06] pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-ink/45">Email</dt>
          <dd className="mt-1 text-sm font-medium text-navy">{admin?.email || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink/45">Mobile</dt>
          <dd className="mt-1 text-sm font-medium text-navy">{formatPhone(admin?.phone_number) || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink/45">Role</dt>
          <dd className="mt-1 text-sm font-medium text-navy">{admin?.role?.name || '—'}</dd>
        </div>
      </dl>
      <p className="mt-5 rounded-xl bg-[#E7F8F0] px-4 py-3 text-sm leading-6 text-navy">
        A code was sent by {channel}
        {expires ? ` and expires ${expires}` : ''}. They sign in with that code.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onAnother}
          className={`inline-flex h-11 cursor-pointer items-center rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
        >
          Onboard another
        </button>
        {canManage ? (
          <Link
            to={paths.admins}
            className={`inline-flex h-11 items-center rounded-xl border border-ink/10 px-4 text-sm font-semibold text-navy hover:border-green/40 ${focusClass}`}
          >
            View admins
          </Link>
        ) : null}
      </div>
    </section>
  )
}
