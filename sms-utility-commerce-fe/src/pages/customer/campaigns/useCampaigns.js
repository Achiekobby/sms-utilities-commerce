import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { seededCampaigns } from './data'

function byCreated(a, b) {
  return b.createdAt.localeCompare(a.createdAt)
}

export function useCampaigns() {
  const created = useSelector((state) => state.campaigns.created)

  return useMemo(() => [...created, ...seededCampaigns].sort(byCreated), [created])
}

export function useCampaign(id) {
  const campaigns = useCampaigns()
  return campaigns.find((campaign) => campaign.id === id) ?? null
}
