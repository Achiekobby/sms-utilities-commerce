import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { PageFrame } from '../../components/PageFrame'
import { selectIsAuthenticated, selectIsVerified } from '../../features/auth/authSlice'
import { paths } from '../../routes/paths'

export function TermsPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isVerified = useSelector(selectIsVerified)
  const backPath = isAuthenticated && isVerified ? paths.app : paths.home

  return (
    <PageFrame>
      <h1 className="text-2xl font-semibold text-navy">Terms</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Use of messaging, wallet payments, and utility purchases is subject to the terms published for your organization.
      </p>
      <p className="mt-8 text-sm">
        <Link to={backPath} className="text-blue">
          Back
        </Link>
      </p>
    </PageFrame>
  )
}
