import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from './authSlice'
import { createPermissionAccess } from './permissions'

export function usePermissions() {
  const user = useSelector(selectCurrentUser)
  const role = user?.role ?? null

  return useMemo(() => createPermissionAccess(role), [role])
}
