import { Outlet } from 'react-router'

// Login, sign up and verify use the full screen: no navbar, no footer.
export function AuthLayout() {
  return (
    <div className="min-h-svh bg-canvas">
      <Outlet />
    </div>
  )
}
