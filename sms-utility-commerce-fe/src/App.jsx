import { RouterProvider } from 'react-router'
import { NotificationsHost } from './features/notifications/NotificationsHost'
import { router } from './routes/router'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <NotificationsHost />
    </>
  )
}
