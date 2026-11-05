import NotificationsSystem, { atalhoTheme, dismissNotification } from 'reapop'
import { useDispatch, useSelector } from 'react-redux'

export function NotificationsHost() {
  const dispatch = useDispatch()
  const notifications = useSelector((state) => state.notifications)

  return (
    <NotificationsSystem
      notifications={notifications ?? []}
      dismissNotification={(id) => dispatch(dismissNotification(id))}
      theme={atalhoTheme}
    />
  )
}
