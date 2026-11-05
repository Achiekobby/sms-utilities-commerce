import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'
import { selectIsAuthenticated, selectPendingVerification } from '../features/auth/authSlice'
import { paths } from './paths'

export function GuestGuard() {
  const signedIn = useSelector(selectIsAuthenticated)
  if (signedIn) return <Navigate to={paths.app} replace />
  return <Outlet />
}

export function VerifyGuard() {
  const signedIn = useSelector(selectIsAuthenticated)
  const pending = useSelector(selectPendingVerification)
  if (signedIn) return <Navigate to={paths.app} replace />
  if (!pending?.email) return <Navigate to={paths.login} replace />
  return <Outlet />
}

export function AuthGuard() {
  const signedIn = useSelector(selectIsAuthenticated)
  const pending = useSelector(selectPendingVerification)
  if (!signedIn && pending?.email) return <Navigate to={paths.verify} replace />
  if (!signedIn) return <Navigate to={paths.login} replace />
  return <Outlet />
}
