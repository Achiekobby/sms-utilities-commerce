import { normalizeTriggerOffset, segmentCount } from './model'

function text(value) {
  if (value == null) return ''
  return String(value).trim()
}

function stamp(value) {
  const raw = text(value)
  if (!raw) return null
  return raw.includes('T') ? raw : raw.replace(' ', 'T')
}

function groupsFrom(ids) {
  return (Array.isArray(ids) ? ids : []).map((id) => ({
    id: String(id),
    name: `Group ${id}`,
    active: 0,
  }))
}

function ctaFrom(cta) {
  if (!cta || typeof cta !== 'object') return null
  if (cta.enabled === false) return null
  const value = text(cta.url) || text(cta.value)
  if (cta.enabled !== true && !value) return null
  if (!text(cta.type) && !value) return null
  return {
    enabled: cta.enabled !== false,
    type: text(cta.type) || 'link',
    value,
    label: text(cta.label),
    triggersReward: cta.triggers_reward === true || cta.triggersReward === true,
  }
}

function money(value) {
  if (value == null || value === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

export function campaignFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null

  const analytics = data.analytics && typeof data.analytics === 'object' ? data.analytics : {}
  const audience = data.audience && typeof data.audience === 'object' ? data.audience : {}
  const reward = data.reward && typeof data.reward === 'object' ? data.reward : {}
  const funding = data.funding && typeof data.funding === 'object' ? data.funding : {}
  const sent = Number(analytics.sent) || 0
  const eligible = Number(audience.eligible_recipients ?? analytics.eligible_recipients ?? reward.eligible_recipients) || 0
  const notEligible = Number(audience.not_eligible ?? analytics.not_eligible) || 0
  const estimatedSmsUnits = Number(audience.estimated_sms_units) || 0
  const body = text(data.body)
  const rewardEnabled = reward.enabled === true

  return {
    id: String(data.id),
    name: text(data.name) || 'Campaign',
    type: text(data.type),
    status: text(data.status) || 'draft',
    occasionType: text(data.occasion_type),
    triggerOffset: normalizeTriggerOffset(data.trigger_offset),
    customOffsetDays: data.custom_offset_days,
    customDate: data.custom_date,
    sendTime: text(data.send_time).slice(0, 5),
    repeatYearly: text(data.occasion_type) === 'birthday' ? data.repeat_yearly !== false : data.repeat_yearly === true,
    sender: text(data.sender),
    body,
    sendAt: stamp(data.send_at),
    createdAt: stamp(data.created_at),
    updatedAt: stamp(data.updated_at),
    activatedAt: stamp(data.activated_at),
    completedAt: stamp(data.completed_at),
    cancelledAt: stamp(data.cancelled_at),
    groups: groupsFrom(data.contact_group_ids),
    recipients: sent || eligible,
    eligibleRecipients: eligible,
    notEligible,
    estimatedSmsUnits,
    segments: Math.max(segmentCount(body), 1),
    sent: sent || null,
    delivered: sent ? Number(analytics.delivered) || 0 : null,
    failed: sent ? Number(analytics.failed) || 0 : null,
    clicks: sent ? Number(analytics.clicks) || 0 : null,
    uniqueClicks: sent ? Number(analytics.unique_clicks) || 0 : null,
    cta: ctaFrom(data.cta),
    trackingUrl: text(data.tracking_url),
    funding: {
      funded: funding.funded === true,
      method: text(funding.method),
      reservedAmount: money(funding.reserved_amount) ?? 0,
      reservedRemaining: money(funding.reserved_remaining) ?? 0,
    },
    reward: {
      enabled: rewardEnabled,
      rewardId: reward.reward_id == null ? '' : String(reward.reward_id),
      type: text(reward.type) === 'money' ? 'cash' : text(reward.type),
      name: text(reward.name),
      amount: reward.amount,
      currency: text(reward.currency) || 'GHS',
      network: text(reward.network),
      bundleId: text(reward.size),
      bundleLabel: text(reward.size) || text(reward.name),
      eligibleRecipients: Number(reward.eligible_recipients) || eligible,
      notEligible: Number(reward.not_eligible) || 0,
      estimatedCost: money(reward.estimated_cost),
      requiresBeneficiary: reward.requires_beneficiary === true,
      beneficiaryMessage: text(reward.beneficiary_message),
      disbursed: sent && rewardEnabled ? Number(analytics.rewards_disbursed) || 0 : null,
      pending: sent && rewardEnabled ? Number(analytics.rewards_pending) || 0 : null,
      failed: sent && rewardEnabled ? Number(analytics.rewards_failed) || 0 : null,
    },
  }
}

export function withGroupNames(campaign, groups) {
  if (!campaign?.groups?.length || !groups?.length) return campaign
  const lookup = new Map(groups.map((group) => [String(group.id), group]))
  return {
    ...campaign,
    groups: campaign.groups.map((group) => {
      const known = lookup.get(group.id)
      return known ? { ...group, name: known.name, active: known.count } : { ...group, name: `Group ${group.id}` }
    }),
  }
}
