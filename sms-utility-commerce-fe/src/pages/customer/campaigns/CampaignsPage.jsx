import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { CampaignList } from './sections/CampaignList'
import { CampaignsHeader } from './sections/CampaignsHeader'
import { useCampaigns } from './useCampaigns'

export function CampaignsPage() {
  useDocumentTitle('Campaigns')
  const campaigns = useCampaigns()

  return (
    <div>
      <CampaignsHeader />
      <CampaignList campaigns={campaigns} />
    </div>
  )
}
