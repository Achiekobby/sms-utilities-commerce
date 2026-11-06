import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { apiErrorMessage, fieldErrors } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  countPermissions,
  moduleLabel,
  permissionCatalog,
  permissionIdsFromRole,
  permissionLabel,
  roleBody,
  roleSignature,
  validateRole,
} from '../../../features/roles/roleModel'
import { useCreateRoleMutation, useGetPermissionsQuery, useGetRoleQuery, useUpdateRoleMutation } from '../../../services/api/roles/rolesApi'
import { PermissionPicker } from './PermissionPicker'
import { focusClass } from './ui'

export function RoleDrawer({ mode, id, onClose, onEdit }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const creating = mode === 'create'
  const editing = mode === 'edit'
  const roleQuery = useGetRoleQuery(id, { skip: creating || !id })
  const catalogQuery = useGetPermissionsQuery(undefined, { skip: mode === 'view' })
  const role = roleQuery.data?.data && typeof roleQuery.data.data === 'object' ? roleQuery.data.data : null
  const waiting = !creating && !role && roleQuery.isFetching && !roleQuery.isError
  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation()
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation()
  const saving = creatingRole || updatingRole

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

  const title = creating ? 'New role' : editing ? 'Edit role' : role?.name || 'Role'

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
      className={`${closing ? 'drawer-right-out' : 'drawer-right'} fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(42rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">{creating ? 'Create' : editing ? 'Update' : 'Role'}</p>
          <h2 id={titleId} className="mt-1 truncate text-lg font-bold tracking-tight text-navy">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => requestClose()}
          disabled={saving}
          aria-label="Close role"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy disabled:opacity-40 ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      {waiting ? <div className="skeleton mx-5 mt-5 h-40 rounded-xl" aria-hidden="true" /> : null}
      {!creating && roleQuery.isError && !role ? (
        <div className="px-5 py-6" role="alert">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(roleQuery.error)}</p>
          <button type="button" onClick={roleQuery.refetch} className={`mt-3 text-sm font-semibold text-blue ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : null}
      {creating || (editing && role) ? (
        <RoleForm
          mode={mode}
          role={role}
          catalog={permissionCatalog(catalogQuery.data?.data)}
          catalogLoading={catalogQuery.isLoading}
          catalogError={catalogQuery.isError ? catalogQuery.error : null}
          onRetryCatalog={catalogQuery.refetch}
          saving={saving}
          onCancel={() => requestClose()}
          onCreate={createRole}
          onUpdate={updateRole}
          onDone={() => requestClose(true)}
        />
      ) : null}
      {!creating && !editing && role ? <RoleSummary role={role} onEdit={onEdit} /> : null}
    </dialog>
  )
}

function RoleSummary({ role, onEdit }) {
  const groups = permissionCatalog(role.permissions)
  const total = countPermissions(groups)
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        <p className="text-sm leading-6 text-ink/70">{role.description}</p>
        <p className="mt-3 text-xs font-medium text-ink/45 tabular-nums">
          {total} {total === 1 ? 'permission' : 'permissions'} across {groups.length} {groups.length === 1 ? 'module' : 'modules'}
        </p>
        <ul className="mt-4 space-y-3">
          {groups.map((group) => (
            <li key={group.module} className="rounded-xl border border-ink/[0.06] bg-[#F7FBF9] p-3">
              <h3 className="text-sm font-semibold text-navy">{moduleLabel(group.module)}</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {group.permissions.map((item) => (
                  <li key={item.id} title={item.name} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy ring-1 ring-ink/10">
                    {permissionLabel(item.name, group.module)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <footer className="border-t border-ink/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={onEdit}
          className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white hover:bg-[#0a3268] ${focusClass}`}
        >
          Edit role
        </button>
      </footer>
    </>
  )
}

function RoleForm({ mode, role, catalog, catalogLoading, catalogError, onRetryCatalog, saving, onCancel, onCreate, onUpdate, onDone }) {
  const nameId = useId()
  const descriptionId = useId()
  const creating = mode === 'create'
  const notify = useNotify()
  const [name, setName] = useState(creating ? '' : role.name ?? '')
  const [description, setDescription] = useState(creating ? '' : role.description ?? '')
  const [ids, setIds] = useState(() => (creating ? [] : permissionIdsFromRole(role)))
  const [query, setQuery] = useState('')
  const [problems, setProblems] = useState({})
  const saved = creating ? '' : roleSignature({ name: role.name, description: role.description, ids: permissionIdsFromRole(role) })
  const dirty = creating || roleSignature({ name, description, ids }) !== saved

  function toggle(id) {
    setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    setProblems((current) => ({ ...current, permissions: undefined }))
  }

  function toggleModule(moduleIds, turnOn) {
    setIds((current) => {
      const next = new Set(current)
      moduleIds.forEach((id) => (turnOn ? next.add(id) : next.delete(id)))
      return [...next]
    })
    setProblems((current) => ({ ...current, permissions: undefined }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    const values = { name, description, ids }
    const found = validateRole(values)
    setProblems(found)
    if (found.name) document.getElementById(nameId)?.focus()
    else if (found.description) document.getElementById(descriptionId)?.focus()
    if (Object.keys(found).length) return

    try {
      if (creating) {
        const result = await onCreate(roleBody(values)).unwrap()
        notify.success(result?.message || 'Role created.')
      } else {
        const result = await onUpdate({ id: role.id, body: roleBody(values) }).unwrap()
        notify.success(result?.message || 'Role updated.')
      }
      onDone()
    } catch (failure) {
      const fields = fieldErrors(failure)
      setProblems({
        name: fields.name,
        description: fields.description,
        permissions: fields.permission_ids,
      })
      notify.error(apiErrorMessage(failure))
    }
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
        <div>
          <label htmlFor={nameId} className="text-sm font-semibold text-navy">
            Role name
          </label>
          <input
            id={nameId}
            value={name}
            maxLength={80}
            aria-invalid={problems.name ? true : undefined}
            onChange={(event) => {
              setName(event.target.value)
              setProblems((current) => ({ ...current, name: undefined }))
            }}
            className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-green ${focusClass} ${
              problems.name ? 'border-[#E0232E]' : 'border-ink/10'
            }`}
          />
          {problems.name ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.name}</p> : null}
        </div>
        <div>
          <label htmlFor={descriptionId} className="text-sm font-semibold text-navy">
            Description
          </label>
          <textarea
            id={descriptionId}
            value={description}
            rows={3}
            maxLength={500}
            aria-invalid={problems.description ? true : undefined}
            onChange={(event) => {
              setDescription(event.target.value)
              setProblems((current) => ({ ...current, description: undefined }))
            }}
            className={`mt-2 w-full resize-y rounded-xl border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-green ${focusClass} ${
              problems.description ? 'border-[#E0232E]' : 'border-ink/10'
            }`}
          />
          {problems.description ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.description}</p> : null}
        </div>
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-navy">Permissions</h3>
              <p className="mt-1 text-sm text-ink/55">{ids.length} selected</p>
            </div>
            <label className="sr-only" htmlFor={`${nameId}-search`}>
              Search permissions
            </label>
            <input
              id={`${nameId}-search`}
              type="search"
              value={query}
              placeholder="Search permissions"
              onChange={(event) => setQuery(event.target.value)}
              className={`h-10 w-full rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink outline-none focus:border-green sm:w-56 ${focusClass}`}
            />
          </div>
          {problems.permissions ? <p className="mt-2 text-xs text-[#9F1C26]">{problems.permissions}</p> : null}
          <div className="mt-3">
            {catalogLoading ? <div className="skeleton h-28 rounded-xl" aria-hidden="true" /> : null}
            {catalogError ? (
              <div role="alert">
                <p className="text-sm text-[#9F1C26]">{apiErrorMessage(catalogError)}</p>
                <button type="button" onClick={onRetryCatalog} className={`mt-2 text-sm font-semibold text-blue ${focusClass}`}>
                  Try again
                </button>
              </div>
            ) : null}
            {!catalogLoading && !catalogError ? (
              <PermissionPicker catalog={catalog} selected={ids} query={query} onToggle={toggle} onToggleModule={toggleModule} />
            ) : null}
          </div>
        </div>
      </div>
      <footer className="flex items-center justify-between gap-3 border-t border-ink/[0.06] px-5 py-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold text-ink/60 hover:text-navy disabled:opacity-40 ${focusClass}`}
          >
            Cancel
          </button>
          {!creating && !dirty ? <p className="px-3 text-xs text-ink/45">No changes to save.</p> : null}
        </div>
        <button
          type="submit"
          disabled={saving || !dirty}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          {saving ? 'Saving' : creating ? 'Create role' : 'Save changes'}
        </button>
      </footer>
    </form>
  )
}
