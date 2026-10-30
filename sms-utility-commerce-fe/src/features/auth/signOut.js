import { baseApi } from '../../services/api/baseApi'
import { authApi } from '../../services/api/auth/authApi'
import { logout } from './authSlice'

function isJwt(token) {
  return typeof token === 'string' && token.split('.').length === 3
}

// Ends the server session, then the local one. A failed request still signs the
// person out here so they are not left in the app with a dead token.
export function signOut() {
  return (dispatch, getState) => {
    const token = getState().auth?.token
    dispatch(logout())

    if (!isJwt(token)) {
      dispatch(baseApi.util.resetApiState())
      return
    }

    const request = dispatch(authApi.endpoints.logout.initiate(token))
    request
      .unwrap()
      .catch(() => {
        // The browser session has already ended.
      })
      .finally(() => {
        request.unsubscribe()
        dispatch(baseApi.util.resetApiState())
      })
  }
}
