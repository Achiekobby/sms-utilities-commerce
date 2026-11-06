import { useEffect, useId, useRef } from 'react'
import { moduleLabel, permissionLabel } from '../../../features/roles/roleModel'
import { focusClass } from './ui'

function ModuleToggle({ label, checked, indeterminate, onChange }) {
  const ref = useRef(null)
  const id = useId()

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label
      htmlFor={id}
      onMouseDown={(event) => event.preventDefault()}
      className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy"
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`size-4 accent-green outline-none ${focusClass}`}
      />
      {label}
    </label>
  )
}

export function PermissionPicker({ catalog, selected, query, onToggle, onToggleModule }) {
  const needle = query.trim().toLowerCase()
  const visible = catalog
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((item) => {
        if (!needle) return true
        const haystack = `${group.module} ${moduleLabel(group.module)} ${item.name} ${permissionLabel(item.name, group.module)}`.toLowerCase()
        return haystack.includes(needle)
      }),
    }))
    .filter((group) => group.permissions.length)
  const chosen = new Set(selected)

  if (!visible.length) {
    return <p className="text-sm text-ink/55">{needle ? `No permissions match “${query.trim()}”.` : 'No permissions are available.'}</p>
  }

  return (
    <div className="space-y-3">
      {visible.map((group) => {
        const ids = group.permissions.map((item) => Number(item.id))
        const picked = ids.filter((id) => chosen.has(id)).length
        return (
          <fieldset key={group.module} className="rounded-xl border border-ink/[0.06] bg-[#F7FBF9] p-3">
            <div className="flex items-center justify-between gap-3">
              <ModuleToggle
                label={moduleLabel(group.module)}
                checked={picked === ids.length}
                indeterminate={picked > 0 && picked < ids.length}
                onChange={() => onToggleModule(ids, picked !== ids.length)}
              />
              <p className="text-xs font-medium text-ink/45 tabular-nums">
                {picked}/{ids.length}
              </p>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {group.permissions.map((item) => {
                const id = Number(item.id)
                const on = chosen.has(id)
                return (
                  <li key={id}>
                    <label
                      onMouseDown={(event) => event.preventDefault()}
                      className={`flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                        on ? 'border-green bg-white font-semibold text-navy' : 'border-transparent bg-white/70 font-medium text-ink/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => onToggle(id)}
                        className={`mt-0.5 size-4 shrink-0 accent-green outline-none ${focusClass}`}
                      />
                      <span className="min-w-0">
                        <span className="block">{permissionLabel(item.name, group.module)}</span>
                        <span className="block truncate text-[11px] font-normal text-ink/40">{item.name}</span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        )
      })}
    </div>
  )
}
