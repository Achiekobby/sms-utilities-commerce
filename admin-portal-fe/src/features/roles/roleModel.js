export function titleCase(value) {
  return String(value ?? '')
    .split(/[._\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function moduleLabel(module) {
  return titleCase(module)
}

export function permissionLabel(name, module) {
  const raw = String(name ?? '')
  const prefix = `${module}.`
  const action = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw
  return titleCase(action) || raw
}

export function permissionCatalog(data) {
  const groups = Array.isArray(data) ? data : []
  return groups
    .map((group) => ({
      module: group?.module ?? '',
      permissions: (Array.isArray(group?.permissions) ? group.permissions : []).filter((item) => item?.id != null),
    }))
    .filter((group) => group.module && group.permissions.length)
}

export function countPermissions(groups) {
  return (groups ?? []).reduce((total, group) => total + (group.permissions?.length ?? 0), 0)
}

export function permissionIdsFromRole(role) {
  const ids = []
  permissionCatalog(role?.permissions).forEach((group) => {
    group.permissions.forEach((item) => ids.push(Number(item.id)))
  })
  return [...new Set(ids)].sort((left, right) => left - right)
}

export function validateRole(values) {
  const errors = {}
  const name = String(values?.name ?? '').trim()
  const description = String(values?.description ?? '').trim()
  if (!name) errors.name = 'Enter a role name.'
  else if (name.length > 80) errors.name = 'Use 80 characters or fewer.'
  if (!description) errors.description = 'Describe what this role is for.'
  else if (description.length > 500) errors.description = 'Use 500 characters or fewer.'
  if (!values?.ids?.length) errors.permissions = 'Choose at least one permission.'
  return errors
}

export function roleBody(values) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    permission_ids: values.ids.map(Number),
  }
}

export function roleSignature(values) {
  const ids = [...(values?.ids ?? [])].map(Number).sort((left, right) => left - right)
  return JSON.stringify({
    name: String(values?.name ?? '').trim(),
    description: String(values?.description ?? '').trim(),
    ids,
  })
}
