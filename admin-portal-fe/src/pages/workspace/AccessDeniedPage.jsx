import { Link } from 'react-router'
import { paths } from '../../routes/paths'

export function AccessDeniedPage() {
  return (
    <div className="max-w-md py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-navy">You don’t have access</h1>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        This page is limited to admins with the required permission.
      </p>
      <Link
        to={paths.app}
        className="mt-6 inline-flex h-9 items-center rounded-md bg-navy px-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
