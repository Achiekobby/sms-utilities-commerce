import { useDispatch, useSelector } from 'react-redux'
import { applyProfile, selectCurrentUser } from '../auth/authSlice'
import { adminFromProfile } from '../auth/session'
import { sameAdmin } from './adminModel'

export function useSyncSelf() {
  const dispatch = useDispatch()
  const currentId = useSelector(selectCurrentUser)?.id

  return (admin) => {
    if (!sameAdmin(admin?.id, currentId)) return
    const patch = adminFromProfile(admin)
    if (patch) dispatch(applyProfile(patch))
  }
}
