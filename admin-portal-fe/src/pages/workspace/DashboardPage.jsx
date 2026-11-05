import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { adminName } from '../../features/auth/session'
import { ActivityBoard } from './dashboard/ActivityBoard'
import { CollectionsStrip } from './dashboard/CollectionsStrip'
import { greeting } from './dashboard/data'
import { MetricCards } from './dashboard/MetricCards'
import { OverviewCharts } from './dashboard/OverviewCharts'

export function DashboardPage() {
  const user = useSelector(selectCurrentUser)
  const name = user?.firstName || adminName(user)

  return (
    <div className="w-full min-w-0">
      <header>
        <p className="text-sm font-medium text-ink/50">{greeting(new Date())}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Hello, {name}.</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Platform traffic, collections, and items waiting on review. Figures on this page are sample data.
        </p>
      </header>
      <CollectionsStrip />
      <MetricCards />
      <OverviewCharts />
      <ActivityBoard />
    </div>
  )
}
