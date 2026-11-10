import { campaignGroups, statusLabel, typeLabel } from './model'

export const statusOptions = ['draft', 'active', 'scheduled', 'sending', 'completed', 'paused', 'failed']

export const typeTabs = [
  { id: 'all', label: 'All' },
  { id: 'occasion', label: 'Occasions' },
  { id: 'promotion', label: 'Promotions' },
]

export const emptyFilters = {
  statuses: [],
  types: [],
  senders: [],
  reward: 'all',
  rewardTypes: [],
}

export const rewardPresenceOptions = [
  { id: 'all', label: 'All' },
  { id: 'with', label: 'With reward' },
  { id: 'without', label: 'Without reward' },
]

export const rewardTypeFilterOptions = [
  { id: 'cash', label: 'Cash' },
  { id: 'airtime', label: 'Airtime' },
  { id: 'data', label: 'Data' },
]

export function activeFilterCount(filters) {
  const rewardExtra = filters.reward && filters.reward !== 'all' ? 1 : 0
  return filters.statuses.length + filters.types.length + filters.senders.length + rewardExtra + (filters.rewardTypes?.length || 0)
}

export function senderOptions(campaigns, approved = []) {
  return [...new Set([...approved, ...campaigns.map((campaign) => campaign.sender).filter(Boolean)])]
}

function includes(list, value) {
  return list.length === 0 || list.includes(value)
}

export function queryCampaigns(
  campaigns,
  {
    search = '',
    statuses = [],
    types = [],
    senders: senderList = [],
    typeTab = 'all',
    reward = 'all',
    rewardTypes = [],
  } = {},
) {
  const term = search.trim().toLowerCase()
  const tabTypes = typeTab && typeTab !== 'all' ? [typeTab] : types

  return campaigns.filter((campaign) => {
    if (!includes(statuses, campaign.status)) return false
    if (!includes(tabTypes, campaign.type)) return false
    if (!includes(senderList, campaign.sender)) return false

    const hasReward = Boolean(campaign.reward?.enabled)
    if (reward === 'with' && !hasReward) return false
    if (reward === 'without' && hasReward) return false
    if (rewardTypes.length && (!hasReward || !rewardTypes.includes(campaign.reward?.type))) return false

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
      campaign.occasionType,
      campaign.reward?.type,
      campaign.reward?.bundleLabel,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(term)
  })
}
