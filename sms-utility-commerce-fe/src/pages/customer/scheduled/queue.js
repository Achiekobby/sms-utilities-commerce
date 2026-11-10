import { useMemo } from 'react'
import { campaignGroups } from '../campaigns/model'
import { useCampaigns } from '../campaigns/useCampaigns'
import { kindLabel } from '../messages/model'
import { useMessages } from '../messages/useMessages'
import { paths } from '../../../routes/paths'

export const scheduleSources = [
  { id: 'campaign', label: 'Campaign' },
  { id: 'groups', label: 'To groups' },
  { id: 'numbers', label: 'To numbers' },
]

function audienceNames(groups) {
  return groups.map((group) => group.name).filter(Boolean).join(', ')
}

function campaignRow(campaign) {
  const groups = campaignGroups(campaign)
  return {
    key: `campaign-${campaign.id}`,
    id: campaign.id,
    source: 'campaign',
    name: campaign.name,
    type: campaign.type,
    sender: campaign.sender,
    recipients: campaign.recipients,
    audience: audienceNames(groups) || 'No group',
    sendAt: campaign.sendAt,
    to: paths.campaign(campaign.id),
  }
}

function messageRow(message) {
  const groups = message.groups ?? []
  return {
    key: `message-${message.id}`,
    id: message.id,
    source: message.kind,
    name: message.name,
    type: message.type,
    sender: message.sender,
    recipients: message.recipients,
    audience: message.kind === 'numbers' ? kindLabel('numbers') : audienceNames(groups) || 'No group',
    sendAt: message.sendAt,
    to: paths.message(message.id),
  }
}

export function useScheduledQueue() {
  const campaigns = useCampaigns()
  const { messages } = useMessages({ page: 1, perPage: 50 })

  return useMemo(() => {
    const rows = [
      ...campaigns.filter((item) => item.status === 'scheduled').map(campaignRow),
      ...messages.filter((item) => item.status === 'scheduled').map(messageRow),
    ]
    return rows.sort((a, b) => String(a.sendAt ?? '').localeCompare(String(b.sendAt ?? '')))
  }, [campaigns, messages])
}

export function sendHasPassed(iso) {
  if (!iso) return false
  const time = new Date(iso).getTime()
  return !Number.isNaN(time) && time <= Date.now()
}
