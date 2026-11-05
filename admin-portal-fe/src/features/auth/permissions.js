export function permissionNames(role) {
  const modules = role?.permissions
  if (!Array.isArray(modules)) return []

  const names = []
  for (const module of modules) {
    const list = module?.permissions
    if (!Array.isArray(list)) continue
    for (const permission of list) {
      if (typeof permission?.name === 'string' && permission.name) names.push(permission.name)
    }
  }
  return names
}

export function createPermissionAccess(role) {
  const names = new Set(permissionNames(role))

  function hasPermission(name) {
    return names.has(name)
  }

  function hasAnyPermission(required) {
    if (!required?.length) return true
    return required.some((name) => names.has(name))
  }

  function hasModulePermission(module) {
    const prefix = `${module}.`
    for (const name of names) {
      if (name.startsWith(prefix)) return true
    }
    return false
  }

  return { names, hasPermission, hasAnyPermission, hasModulePermission }
}

function isAllowed(access, permissions) {
  if (!permissions?.length) return true
  return access.hasAnyPermission(permissions)
}

export function filterNavigation(groups, access) {
  return groups.flatMap((group) => {
    const items = group.items.flatMap((item) => {
      if (item.children) {
        const children = item.children.filter((child) => isAllowed(access, child.permissions))
        if (!children.length) return []
        if (children.length === 1) return [children[0]]
        return [{ ...item, children }]
      }
      return isAllowed(access, item.permissions) ? [item] : []
    })

    if (!items.length) return []
    return [{ ...group, items }]
  })
}

export function flattenNavigation(groups) {
  return groups.flatMap((group) =>
    group.items.flatMap((item) => (item.children ? item.children : [item])),
  )
}
