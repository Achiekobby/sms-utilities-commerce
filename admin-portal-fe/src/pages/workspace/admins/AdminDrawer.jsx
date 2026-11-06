import { Mail, Phone, Shield, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { adminDirty, adminFieldErrors, adminName, adminUpdateBody, sameAdmin, validateAdmin, valuesFromAdmin, withCurrentRole } from '../../../features/admins/adminModel'
import { useSyncSelf } from '../../../features/admins/useSyncSelf'
import { selectCurrentUser } from '../../../features/auth/authSlice'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { useNotify } from '../../../features/notifications/useNotify'
import { formatPhone, formatWhen, photoError } from '../../../features/onboarding/clientOnboarding'
import { countPermissions, moduleLabel, permissionCatalog, permissionLabel } from '../../../features/roles/roleModel'
import { paths } from '../../../routes/paths'
import { useAssignAdminRoleMutation, useGetAdminQuery, useUpdateAdminMutation } from '../../../services/api/admins/adminsApi'
import { useGetRolesQuery } from '../../../services/api/roles/rolesApi'
import { AdminAvatar } from './AdminAvatar'
import { AdminFields } from './AdminFields'
import { focusClass, inputClass } from './ui'

export function AdminDrawer({ id, mode, focusRole = false, self = false, onClose, onMode, onStatus, onDelete }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const editing = mode === 'edit'
  const adminQuery = useGetAdminQuery(id, { skip: !id })
  const admin = adminQuery.data?.data && typeof adminQuery.data.data === 'object' ? adminQuery.data.data : null
  const waiting = !admin && adminQuery.isFetching && !adminQuery.isError
  const [updateAdmin, { isLoading: updating }] = useUpdateAdminMutation()
  const [assignRole, { isLoading: assigning }] = useAssignAdminRoleMutation()
  const saving = updating || assigning
  const name = adminName(admin)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!closing) return undefined
    const timer = window.setTimeout(() => onCloseRef.current(), 240)
    return () => window.clearTimeout(timer)
  }, [closing])

  function requestClose(force = false) {
    if (closing || (force !== true && saving)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    setClosing(true)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      className={`${closing ? 'drawer-right-out' : 'drawer-right'} fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(36rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">{editing ? 'Edit details' : 'Admin'}</p>
          <h2 id={titleId} className="mt-1 truncate text-lg font-bold tracking-tight text-navy">
            {admin ? name : 'Team member'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => requestClose()}
          disabled={saving}
          aria-label="Close admin"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy disabled:opacity-40 ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {waiting ? <div className="skeleton h-40 rounded-xl" aria-hidden="true" /> : null}
        {adminQuery.isError && !admin ? (
          <div role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(adminQuery.error)}</p>
            <button type="button" onClick={adminQuery.refetch} className={`mt-3 text-sm font-semibold text-blue ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}
        {editing && admin ? (
          <AdminEditForm
            admin={admin}
            saving={updating}
            onCancel={() => onMode('view')}
            onUpdate={updateAdmin}
          />
        ) : null}
        {!editing && admin ? (
          <AdminSummary
            admin={admin}
            self={self}
            focusRole={focusRole}
            assigning={assigning}
            onEdit={() => onMode('edit')}
            onAssign={assignRole}
            onStatus={onStatus}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    </dialog>
  )
}

function AdminEditForm({ admin, saving, onCancel, onUpdate }) {
  const notify = useNotify()
  const syncSelf = useSyncSelf()
  const formRef = useRef(null)
  const baseline = valuesFromAdmin(admin)
  const [values, setValues] = useState(baseline)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [preview, setPreview] = useState('')
  const previewRef = useRef('')
  const dirty = adminDirty(values, baseline)

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  useEffect(() => {
    if (!attempt) return
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [attempt])

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

  async function submit(event) {
    event.preventDefault()
    if (saving || !dirty) return
    const found = validateAdmin(values)
    if (Object.keys(found).length) {
      setErrors(found)
      setFormError('')
      setAttempt((count) => count + 1)
      return
    }

    try {
      const result = await onUpdate({ id: admin.id, body: adminUpdateBody(values) }).unwrap()
      const message = result?.message || 'Admin updated.'
      syncSelf(result?.data)
      notify.success(message)
      onCancel()
    } catch (error) {
      const parsed = adminFieldErrors(error)
      setErrors(parsed.fields)
      setFormError(parsed.formError)
      setAttempt((count) => count + 1)
      if (parsed.formError) notify.error(parsed.formError)
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="grid gap-5">
      {formError ? (
        <p className="rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-3.5 py-3 text-sm text-[#9F1C26]" role="alert">
          {formError}
        </p>
      ) : null}
      <AdminFields values={values} errors={errors} onChange={change} preview={preview} imageUrl={admin.profile_image} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || !dirty}
          aria-busy={saving}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
        >
          {saving ? 'Saving details' : 'Save details'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-ink/10 px-4 text-sm font-semibold text-navy hover:border-green/40 disabled:opacity-50 ${focusClass}`}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function AdminSummary({ admin, self, focusRole, assigning, onEdit, onAssign, onStatus, onDelete }) {
  const active = admin.status === 'active'
  const groups = permissionCatalog(admin.role?.permissions)
  const total = countPermissions(groups)

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <AdminAvatar admin={admin} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-bold text-navy">{adminName(admin)}</p>
            {self ? <span className="rounded-full bg-[#E7F0FF] px-2 py-0.5 text-[11px] font-semibold text-blue">You</span> : null}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${active ? 'bg-[#E7F8F0] text-green' : 'bg-[#F3F6FB] text-navy'}`}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/55">{formatWhen(admin.last_login_at) ? `Last sign-in ${formatWhen(admin.last_login_at)}` : 'Has not signed in yet'}</p>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Fact icon={Mail} label="Email" value={admin.email} />
        <Fact icon={Phone} label="Mobile" value={formatPhone(admin.phone_number)} />
      </dl>

      <RoleAssign admin={admin} focusRole={focusRole} assigning={assigning} onAssign={onAssign} />

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-bold text-navy">Access from this role</h3>
          <p className="text-xs text-ink/45">{total ? `${total} ${total === 1 ? 'permission' : 'permissions'}` : 'None'}</p>
        </div>
        {groups.length ? (
          <ul className="mt-3 grid gap-3">
            {groups.map((group) => (
              <li key={group.module} className="rounded-xl border border-ink/[0.06] px-3 py-3">
                <p className="text-xs font-semibold tracking-wide text-ink/50 uppercase">{moduleLabel(group.module)}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {group.permissions.map((item) => (
                    <li key={item.id} className="rounded-full bg-[#F3F6FB] px-2 py-0.5 text-[11px] font-medium text-navy">
                      {permissionLabel(item.name, group.module)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/55">This role does not grant any permissions yet.</p>
        )}
      </section>

      <div className="flex flex-wrap gap-2 border-t border-ink/[0.06] pt-4">
        <button
          type="button"
          onClick={onEdit}
          className={`inline-flex h-10 cursor-pointer items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white ${focusClass}`}
        >
          Edit details
        </button>
        {onStatus ? (
          <button
            type="button"
            onClick={() => onStatus(admin)}
            className={`inline-flex h-10 cursor-pointer items-center rounded-xl border px-4 text-sm font-semibold ${focusClass} ${
              active ? 'border-[#E0232E]/30 text-[#9F1C26]' : 'border-green/30 text-green'
            }`}
          >
            {active ? 'Deactivate' : 'Activate'}
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(admin)}
            className={`inline-flex h-10 cursor-pointer items-center rounded-xl border border-[#E0232E]/30 px-4 text-sm font-semibold text-[#9F1C26] ${focusClass}`}
          >
            Delete
          </button>
        ) : null}
      </div>
      {self ? (
        <p className="text-sm leading-6 text-ink/55">This is your account. Profile and role can be changed here. Status and deletion stay on the other admins.</p>
      ) : null}
    </div>
  )
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-ink/45">{label}</dt>
      <dd className="mt-1 flex items-start gap-2 text-sm font-medium text-navy">
        <Icon size={15} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ink/35" aria-hidden="true" />
        <span className="min-w-0 break-all">{value || '—'}</span>
      </dd>
    </div>
  )
}

function RoleAssign({ admin, focusRole, assigning, onAssign }) {
  const access = usePermissions()
  const currentId = useSelector(selectCurrentUser)?.id
  const notify = useNotify()
  const syncSelf = useSyncSelf()
  const canManageRoles = access.hasPermission('role.manage')
  const rolesQuery = useGetRolesQuery({ page: 1, perPage: 100 })
  const roles = withCurrentRole(Array.isArray(rolesQuery.data?.data) ? rolesQuery.data.data : [], admin.role)
  const source = admin.role?.id != null ? String(admin.role.id) : ''
  const [seen, setSeen] = useState(source)
  const [roleId, setRoleId] = useState(source)
  const [error, setError] = useState('')
  const selectId = useId()
  if (seen !== source) {
    setSeen(source)
    setRoleId(source)
  }

  useEffect(() => {
    if (!focusRole) return undefined
    const timer = window.setTimeout(() => {
      document.getElementById(selectId)?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [focusRole, selectId])

  const selected = roles.find((role) => String(role.id) === roleId) ?? null
  const unchanged = roleId === source || !roleId
  const changingSelf = sameAdmin(admin.id, currentId) && !unchanged

  async function submit(event) {
    event.preventDefault()
    if (assigning || unchanged) return
    setError('')
    try {
      const result = await onAssign({ id: admin.id, roleId }).unwrap()
      const message = result?.message || 'Role assigned.'
      syncSelf(result?.data)
      notify.success(message)
    } catch (failure) {
      const message = apiErrorMessage(failure)
      setError(message)
      notify.error(message)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-ink/[0.06] bg-[#F7FAF8] p-4">
      <div className="flex items-center gap-2">
        <Shield size={16} strokeWidth={1.8} className="text-green" aria-hidden="true" />
        <h3 className="text-sm font-bold text-navy">Role</h3>
      </div>
      <p className="mt-1 text-sm leading-5 text-ink/60">
        {admin.role?.description || 'Choose the role that sets this admin’s access.'}
      </p>
      <label htmlFor={selectId} className="mt-3 mb-2 block text-sm font-semibold text-navy">
        Assigned role
      </label>
      <select
        id={selectId}
        value={roleId}
        disabled={rolesQuery.isLoading || assigning}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${selectId}-message`}
        onChange={(event) => {
          setError('')
          setRoleId(event.target.value)
        }}
        className={inputClass(Boolean(error))}
      >
        <option value="">{rolesQuery.isLoading ? 'Loading roles…' : 'Select a role'}</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      <p id={`${selectId}-message`} className={`mt-1.5 text-xs leading-5 ${error || rolesQuery.isError ? 'text-[#9F1C26]' : 'text-ink/45'}`}>
        {error ||
          (rolesQuery.isError
            ? apiErrorMessage(rolesQuery.error)
            : unchanged && selected
              ? `${selected.name} is the current role.`
              : selected
                ? `${selected.name} will replace the current role.`
                : 'Pick a role, then assign it.')}
      </p>
      {rolesQuery.isError ? (
        <button type="button" onClick={rolesQuery.refetch} className={`mt-2 text-sm font-semibold text-blue ${focusClass}`}>
          Try again
        </button>
      ) : null}
      {changingSelf ? (
        <p className="mt-3 rounded-xl bg-[#FFF4DF] px-3 py-2 text-sm leading-5 text-[#9A5B00]">
          This is your account. The new role replaces your access as soon as it is assigned.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={unchanged || assigning || rolesQuery.isError}
          aria-busy={assigning}
          className={`inline-flex h-10 cursor-pointer items-center rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
        >
          {assigning ? 'Assigning role' : 'Assign role'}
        </button>
        {canManageRoles ? (
          <Link to={paths.roles} className={`text-sm font-semibold text-blue ${focusClass}`}>
            Manage roles
          </Link>
        ) : null}
      </div>
    </form>
  )
}
