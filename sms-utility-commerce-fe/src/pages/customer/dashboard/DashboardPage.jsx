import { useState } from 'react'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { getPresetRange } from './dateRanges'
import { DashboardHeader } from './sections/DashboardHeader'
import { MessageCharts } from './sections/MessageCharts'
import { ModuleCards } from './sections/ModuleCards'
import { MetricCards } from './sections/MetricCards'
import { RecentCampaigns } from './sections/RecentCampaigns'
import { WalletPanel } from './sections/WalletPanel'

export function DashboardPage() {
  useDocumentTitle('Dashboard')
  const [range, setRange] = useState(() => getPresetRange('this-month'))

  return (
    <div>
      <DashboardHeader range={range} onRangeChange={setRange} />
      <WalletPanel />
      <MetricCards compare={range.compare} />
      <MessageCharts />
      <RecentCampaigns />
      <ModuleCards />
    </div>
  )
}
