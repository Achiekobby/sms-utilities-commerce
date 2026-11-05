import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { useNotify } from '../notifications/useNotify'
import { paths } from '../../routes/paths'
import { useLogoutMutation } from '../../services/api/auth/authApi'
import { logout } from './authSlice'
import { apiErrorMessage } from './session'

export function useSignOut() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notify = useNotify()
  const [signOut, { isLoading }] = useLogoutMutation()

  async function signOutAdmin() {
    try {
      await signOut().unwrap()
      dispatch(logout())
      navigate(paths.login, { replace: true })
    } catch (signOutError) {
      if (signOutError?.status === 401) {
        dispatch(logout())
        navigate(paths.login, { replace: true })
        return
      }
      notify.error(apiErrorMessage(signOutError))
    }
  }

  return { signOutAdmin, signingOut: isLoading }
}
