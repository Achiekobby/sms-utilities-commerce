import { Navigate } from 'react-router'
import { paths } from '../../../routes/paths'

export function RequestSenderPage() {
  return <Navigate to={paths.senderIds} replace />
}
