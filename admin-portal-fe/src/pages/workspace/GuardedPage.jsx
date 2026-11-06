import { usePermissions } from '../../features/auth/usePermissions'
import { AccessDeniedPage } from './AccessDeniedPage'
import { ModulePage } from './ModulePage'

export function GuardedPage({ permissions, title }) {
  const access = usePermissions()
  if (!access.hasAnyPermission(permissions)) return <AccessDeniedPage />
  return <ModulePage title={title} />
}
