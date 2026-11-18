import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useApiErrorToast } from '../../../../features/notifications/useApiErrorToast'
import { useGetCampaignQuery } from '../../../../services/api/campaigns/campaignsApi'
import { useGetContactGroupsQuery } from '../../../../services/api/contacts/contactsApi'
import { withGroupNames } from '../fromApi'
import { NewCampaignPage } from './NewCampaignPage'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function EditCampaignPage() {
  const { campaignId } = useParams()
  const detail = useGetCampaignQuery(campaignId, { skip: !campaignId })
  useApiErrorToast(detail.error, detail.isError && !detail.isFetching)
  const groups = useGetContactGroupsQuery()
  const campaign = useMemo(
    () => (detail.data ? withGroupNames(detail.data, groups.data) : null),
    [detail.data, groups.data],
  )

  if (detail.isLoading) {
    return (
      <div role="status" className="space-y-3">
        <span className="sr-only">Loading campaign</span>
        <span className="skeleton block h-8 w-48 rounded-lg" />
        <span className="skeleton block h-64 rounded-xl" />
      </div>
    )
  }

  if (detail.isError) {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#9F1C26]">This campaign could not be loaded.</p>
        <button type="button" onClick={detail.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
          Try again
        </button>
      </div>
    )
  }

  if (!campaign) return null

  return <NewCampaignPage key={campaign.id} campaign={campaign} />
}
