import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { CampaignList } from './sections/CampaignList'
import { CampaignsHeader } from './sections/CampaignsHeader'

export function CampaignsPage() {
  useDocumentTitle('SMS Campaigns')

  return (
    <div>
      <CampaignsHeader />
      <CampaignList />
    </div>
  )
}
