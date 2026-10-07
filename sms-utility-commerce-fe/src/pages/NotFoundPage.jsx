import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { PageFrame } from '../components/PageFrame'
import { selectIsAuthenticated, selectIsVerified } from '../features/auth/authSlice'
import { paths } from '../routes/paths'

export function NotFoundPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isVerified = useSelector(selectIsVerified)
  const destination = isAuthenticated && isVerified ? paths.app : paths.home

  return (
    <PageFrame>
      <h1 className="text-2xl font-semibold text-navy">Page not found</h1>
      <p className="mt-3 text-sm text-ink/70">That address is not part of the app.</p>
      <p className="mt-8 text-sm">
        <Link to={destination} className="text-blue">
          Go to the start
        </Link>
      </p>
    </PageFrame>
  )
}
