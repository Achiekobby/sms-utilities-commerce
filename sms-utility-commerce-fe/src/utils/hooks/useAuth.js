import { useSelector } from 'react-redux'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsVerified,
} from '../../features/auth/authSlice'

export function useAuth() {
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isVerified = useSelector(selectIsVerified)
  const accountType = user?.accountType ?? null

  return {
    user,
    isAuthenticated,
    isVerified,
    accountType,
    isBusiness: accountType === 'business',
    isIndividual: accountType === 'individual',
  }
}
