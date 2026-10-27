import { campaignGroups, statusLabel, typeLabel } from './model'

export const statusOptions = ['scheduled', 'in_progress', 'completed']

export const emptyFilters = {
  statuses: [],
  types: [],
  senders: [],
}

export function activeFilterCount(filters) {
  return filters.statuses.length + filters.types.length + filters.senders.length
}

export function senderOptions(campaigns, approved = []) {
  return [...new Set([...approved, ...campaigns.map((campaign) => campaign.sender)])]
}

function includes(list, value) {
  return list.length === 0 || list.includes(value)
}

export function queryCampaigns(campaigns, { search = '', statuses = [], types = [], senders: senderList = [] } = {}) {
  const term = search.trim().toLowerCase()

  return campaigns.filter((campaign) => {
    if (!includes(statuses, campaign.status)) return false
    if (!includes(types, campaign.type)) return false
    if (!includes(senderList, campaign.sender)) return false
    if (!term) return true

    const haystack = [
      campaign.name,
      campaignGroups(campaign)
        .map((group) => group.name)
        .join(' '),
      campaign.sender,
      typeLabel(campaign.type),
      statusLabel[campaign.status],
      campaign.body,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(term)
  })
}
