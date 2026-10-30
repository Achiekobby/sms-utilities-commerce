import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation, useMatches } from 'react-router'
import { clearForceLogin, requireLogin, selectForceLogin } from '../features/auth/accessSlice'
import {
  logout,
  selectIsAuthenticated,
  selectIsVerified,
  selectPendingVerification,
} from '../features/auth/authSlice'
import { paths, safeCustomerReturn } from './paths'

function ClearUnverifiedSession() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(logout())
    dispatch(requireLogin())
  }, [dispatch])

  return null
}

function GuestHome() {
  const dispatch = useDispatch()
  const forceLogin = useSelector(selectForceLogin)

  useEffect(() => {
    if (forceLogin) dispatch(clearForceLogin())
  }, [dispatch, forceLogin])

  return <Outlet />
}

export function GuestGuard() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isVerified = useSelector(selectIsVerified)
  const pending = useSelector(selectPendingVerification)
  const forceLogin = useSelector(selectForceLogin)
  const location = useLocation()
  const matches = useMatches()
  const allowAuthenticated = matches.some((match) => match.handle?.allowAuthenticated)
  const mustClear = (isAuthenticated && !isVerified) || Boolean(pending)
  const isHome = location.pathname === paths.home

  if (mustClear) return <ClearUnverifiedSession />

  if (!isAuthenticated && forceLogin && isHome) return <GuestHome />

  if (!isAuthenticated && forceLogin) return <Navigate to={paths.login} replace />

  if (isAuthenticated && isVerified && !allowAuthenticated) {
    return <Navigate to={paths.app} replace />
  }

  return <Outlet />
}

export function AuthGuard() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isVerified = useSelector(selectIsVerified)
  const pending = useSelector(selectPendingVerification)
  const forceLogin = useSelector(selectForceLogin)
  const location = useLocation()
  const switchingAccount = location.state?.switchAccount === true

  useEffect(() => {
    if (!isAuthenticated && forceLogin) dispatch(clearForceLogin())
  }, [dispatch, forceLogin, isAuthenticated])

  useEffect(() => {
    if (switchingAccount) dispatch(logout())
  }, [dispatch, switchingAccount])

  if (pending && !switchingAccount) {
    return <Navigate to={paths.verify} replace state={{ from: location.state?.from }} />
  }

  if (!isAuthenticated) return <Outlet />

  if (!isVerified) {
    return <Navigate to={paths.verify} replace state={{ from: location.state?.from }} />
  }

  return <Navigate to={safeCustomerReturn(location.state?.from)} replace />
}

export function VerifyGuard() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isVerified = useSelector(selectIsVerified)
  const pending = useSelector(selectPendingVerification)
  const location = useLocation()

  if (isVerified) {
    return <Navigate to={safeCustomerReturn(location.state?.from)} replace />
  }

  if (!pending && !isAuthenticated) return <Navigate to={paths.login} replace />

  return <Outlet />
}

export function CustomerGuard() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isVerified = useSelector(selectIsVerified)
  const pending = useSelector(selectPendingVerification)
  const location = useLocation()

  if (pending && !isAuthenticated) {
    return <Navigate to={paths.verify} replace state={{ from: location }} />
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }

  if (!isVerified) {
    return <Navigate to={paths.verify} replace state={{ from: location }} />
  }

  return <Outlet />
}
