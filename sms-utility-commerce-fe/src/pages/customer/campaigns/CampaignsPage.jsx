import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { CampaignList } from './sections/CampaignList'
import { CampaignMetrics } from './sections/CampaignMetrics'
import { CampaignsHeader } from './sections/CampaignsHeader'
import { useCampaigns } from './useCampaigns'

export function CampaignsPage() {
  useDocumentTitle('SMS Campaigns')
  const campaigns = useCampaigns()

  return (
    <div>
      <CampaignsHeader />
      {campaigns.length ? <CampaignMetrics campaigns={campaigns} /> : null}
      <CampaignList campaigns={campaigns} />
    </div>
  )
}
