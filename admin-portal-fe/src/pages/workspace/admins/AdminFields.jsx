import { ImagePlus } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router'
import { countPermissions, moduleLabel, permissionCatalog, permissionLabel } from '../../../features/roles/roleModel'
import { phoneInput, photoTypes } from '../../../features/onboarding/clientOnboarding'
import { paths } from '../../../routes/paths'
import { focusClass, inputClass } from './ui'

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
    <p id={id} className={`mt-1.5 text-xs leading-5 ${error ? 'text-[#9F1C26]' : 'text-ink/45'}`}>
      {error || hint}
    </p>
  )
}

export function AdminFields({
  values,
  errors,
  onChange,
  preview,
  imageUrl = '',
  showRole = false,
  roles = [],
  rolesLoading = false,
  rolesError = '',
  onRetryRoles,
  canManageRoles = false,
}) {
  const reactId = useId()
  const [imageFailed, setImageFailed] = useState(false)
  const ids = {
    firstName: `${reactId}-first`,
    lastName: `${reactId}-last`,
    email: `${reactId}-email`,
    phone: `${reactId}-phone`,
    roleId: `${reactId}-role`,
    profileImage: `${reactId}-photo`,
  }
  const selected = roles.find((role) => String(role.id) === String(values.roleId)) ?? null
  const shownImage = preview || (!imageFailed && imageUrl ? imageUrl : '')

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={ids.firstName}
          name="firstName"
          label="First name"
          autoComplete="given-name"
          value={values.firstName}
          error={errors.firstName}
          onChange={(value) => onChange('firstName', value)}
        />
        <TextField
          id={ids.lastName}
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          value={values.lastName}
          error={errors.lastName}
          onChange={(value) => onChange('lastName', value)}
        />
      </div>

      <TextField
        id={ids.email}
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        hint="They will receive a one-time code at this address."
        onChange={(value) => onChange('email', value)}
      />

      <div>
        <label htmlFor={ids.phone} className="mb-2 block text-sm font-semibold text-navy">
          Mobile number
          <RequiredMark />
        </label>
        <div
          className={`flex h-12 overflow-hidden rounded-xl border bg-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue ${
            errors.phone ? 'border-[#E0232E]' : 'border-ink/10 focus-within:border-green'
          }`}
        >
          <span className="flex items-center border-r border-ink/10 bg-ink/[0.03] px-3 text-sm font-semibold text-navy">+233</span>
          <input
            id={ids.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="24 123 4567"
            maxLength={20}
            value={values.phone}
            aria-invalid={errors.phone ? true : undefined}
            aria-required="true"
            aria-describedby={`${ids.phone}-message`}
            onChange={(event) => onChange('phone', phoneInput(event.target.value))}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink/35"
          />
        </div>
        <FieldMessage id={`${ids.phone}-message`} error={errors.phone} hint="Ghana number, for example 024 123 4567. You can paste +233 as well." />
      </div>

      {showRole ? (
        <div>
          <label htmlFor={ids.roleId} className="mb-2 block text-sm font-semibold text-navy">
            Role
            <RequiredMark />
          </label>
          <select
            id={ids.roleId}
            name="roleId"
            value={values.roleId}
            disabled={rolesLoading || Boolean(rolesError)}
            aria-invalid={errors.roleId ? true : undefined}
            aria-required="true"
            aria-describedby={`${ids.roleId}-message`}
            onChange={(event) => onChange('roleId', event.target.value)}
            className={inputClass(errors.roleId)}
          >
            <option value="">{rolesLoading ? 'Loading roles…' : 'Select a role'}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <FieldMessage
            id={`${ids.roleId}-message`}
            error={errors.roleId || rolesError}
            hint="The role decides which parts of the portal they can use."
          />
          {rolesError && onRetryRoles ? (
            <button type="button" onClick={onRetryRoles} className={`mt-2 text-sm font-semibold text-blue ${focusClass}`}>
              Try again
            </button>
          ) : null}
          {selected ? <RolePreview role={selected} canManageRoles={canManageRoles} /> : null}
        </div>
      ) : null}

      <div>
        <label htmlFor={ids.profileImage} className="mb-2 block text-sm font-semibold text-navy">
          Profile photo
        </label>
        <div className="flex items-center gap-4">
          <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3F6FB] text-navy">
            {shownImage ? (
              <img src={shownImage} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setImageFailed(true)} />
            ) : (
              <ImagePlus size={18} strokeWidth={1.8} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <input
              id={ids.profileImage}
              name="profileImage"
              type="file"
              accept={photoTypes.join(',')}
              aria-invalid={errors.profileImage ? true : undefined}
              aria-describedby={`${ids.profileImage}-message`}
              onChange={(event) => onChange('profileImage', event.target.files?.[0] ?? null)}
              className={`block w-full text-sm text-ink/70 file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#E7F8F0] file:px-3 file:text-sm file:font-semibold file:text-navy hover:file:bg-[#d7f3e6] ${focusClass}`}
            />
            <FieldMessage id={`${ids.profileImage}-message`} error={errors.profileImage} hint="Optional. JPG, PNG, or WebP under 2 MB." />
          </div>
        </div>
      </div>
    </div>
  )
}

function TextField({ id, name, label, value, error, hint, onChange, type = 'text', autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy">
        {label}
        <RequiredMark />
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-required="true"
        aria-describedby={hint || error ? `${id}-message` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass(error)}
      />
      {hint || error ? <FieldMessage id={`${id}-message`} error={error} hint={hint} /> : null}
    </div>
  )
}

function RolePreview({ role, canManageRoles }) {
  const groups = permissionCatalog(role.permissions)
  const total = countPermissions(groups)
  const chips = groups.flatMap((group) =>
    group.permissions.map((item) => ({
      id: item.id,
      label: `${moduleLabel(group.module)} · ${permissionLabel(item.name, group.module)}`,
    })),
  )
  const shown = chips.slice(0, 8)
  const rest = chips.length - shown.length

  return (
    <div className="mt-3 rounded-xl bg-[#F3F6FB] px-3.5 py-3">
      <p className="text-sm font-semibold text-navy">{role.name}</p>
      {role.description ? <p className="mt-1 text-sm leading-5 text-ink/65">{role.description}</p> : null}
      <p className="mt-2 text-xs font-medium text-ink/50">
        {total ? `${total} ${total === 1 ? 'permission' : 'permissions'}` : 'No permissions on this role yet.'}
      </p>
      {shown.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {shown.map((chip) => (
            <li key={chip.id} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-navy">
              {chip.label}
            </li>
          ))}
          {rest > 0 ? <li className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-ink/50">+{rest} more</li> : null}
        </ul>
      ) : null}
      {canManageRoles ? (
        <Link to={paths.roles} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
          Manage roles
        </Link>
      ) : null}
    </div>
  )
}
