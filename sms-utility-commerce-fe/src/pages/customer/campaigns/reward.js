import { formatCount } from '../dashboard/format'
import { formatUnits, parseCediInput, unitsPerCedi } from '../wallet/money'

export const rewardCurrency = 'GHS'
export const rewardCurrencyLabel = 'GH₵'

export const rewardTypes = [
  {
    id: 'cash',
    label: 'Cash',
    description: 'Send money directly to eligible recipients.',
    example: 'GHS 10 per recipient',
    available: true,
  },
  {
    id: 'airtime',
    label: 'Airtime',
    description: 'Send mobile airtime to recipients.',
    example: 'GHS 5 airtime',
    available: true,
  },
  {
    id: 'data',
    label: 'Data bundle',
    description: 'Send a mobile internet bundle to recipients.',
    example: '1 GB data',
    available: true,
  },
]

export const airtimePresets = [
  { id: '1', label: 'GHS 1', amount: 1 },
  { id: '2', label: 'GHS 2', amount: 2 },
  { id: '5', label: 'GHS 5', amount: 5 },
  { id: '10', label: 'GHS 10', amount: 10 },
  { id: '20', label: 'GHS 20', amount: 20 },
  { id: 'custom', label: 'Custom', amount: null },
]

/** Mock provider catalog — replace with API when available. */
export const dataBundles = [
  { id: '100mb', label: '100 MB', network: 'any', price: 1 },
  { id: '500mb', label: '500 MB', network: 'any', price: 3 },
  { id: '1gb', label: '1 GB', network: 'any', price: 5 },
  { id: '2gb', label: '2 GB', network: 'any', price: 8 },
  { id: '5gb', label: '5 GB', network: 'any', price: 18 },
]

export const rewardStatusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  successful: 'Successful',
  failed: 'Failed',
  not_eligible: 'Not eligible',
  cancelled: 'Cancelled',
  disbursed: 'Successful',
}

export const rewardStatusTone = {
  pending: 'bg-[#EEF2F7] text-ink/70',
  processing: 'bg-[#E8F1FC] text-blue',
  successful: 'bg-[#DDF3E6] text-green',
  disbursed: 'bg-[#DDF3E6] text-green',
  failed: 'bg-[#FDECEE] text-[#C21F2D]',
  not_eligible: 'bg-[#FFF4E5] text-[#B45F06]',
  cancelled: 'bg-[#EEF2F7] text-ink/55',
}

export const ineligibilityReasons = [
  { id: 'missing_phone', label: 'Missing phone number' },
  { id: 'unsupported_network', label: 'Unsupported mobile network' },
  { id: 'invalid_phone', label: 'Invalid mobile number' },
  { id: 'missing_momo', label: 'Missing mobile money information' },
  { id: 'duplicate', label: 'Duplicate contact' },
  { id: 'provider_limit', label: 'Reward provider limitation' },
]

export function rewardTypeMeta(type) {
  return rewardTypes.find((item) => item.id === type) ?? null
}

export function dataBundleById(id) {
  return dataBundles.find((item) => item.id === id) ?? null
}

/** Deterministic mock eligibility from audience size until backend supplies counts. */
export function estimateRewardEligibility(smsRecipients) {
  const total = Math.max(0, Number(smsRecipients) || 0)
  if (total === 0) {
    return {
      smsRecipients: 0,
      eligible: 0,
      notEligible: 0,
      reasons: [],
    }
  }
  const notEligible = Math.min(total, Math.max(1, Math.round(total * 0.045)))
  const eligible = total - notEligible
  const slice = Math.max(1, Math.floor(notEligible / 3))
  return {
    smsRecipients: total,
    eligible,
    notEligible,
    reasons: [
      { id: 'missing_phone', label: 'Missing phone number', count: slice },
      { id: 'unsupported_network', label: 'Unsupported mobile network', count: Math.max(0, notEligible - slice * 2) },
      { id: 'invalid_phone', label: 'Invalid mobile number', count: Math.min(slice, notEligible - slice) },
    ].filter((item) => item.count > 0),
  }
}

export function parseRewardAmount(raw) {
  const units = parseCediInput(raw)
  if (units == null) return null
  return units / unitsPerCedi
}

export function rewardAmountCedis(reward) {
  if (!reward?.enabled) return 0
  if (reward.type === 'data') {
    return Number(dataBundleById(reward.bundleId)?.price) || 0
  }
  if (reward.type === 'airtime' && reward.airtimePreset && reward.airtimePreset !== 'custom') {
    const preset = airtimePresets.find((item) => item.id === reward.airtimePreset)
    return Number(preset?.amount) || 0
  }
  return Number(reward.amount) || 0
}

export function rewardCostUnits(reward, eligibleRecipients) {
  const per = rewardAmountCedis(reward)
  const count = Math.max(0, Number(eligibleRecipients) || 0)
  return Math.round(per * count * unitsPerCedi)
}

export function formatRewardMoney(cedis) {
  return formatUnits(Math.round(Number(cedis) * unitsPerCedi) || 0)
}

export function formatRewardValue(reward) {
  if (!reward?.enabled) return '—'
  if (reward.type === 'cash') return `${formatRewardMoney(reward.amount)} cash`
  if (reward.type === 'airtime') return `${formatRewardMoney(rewardAmountCedis(reward))} airtime`
  if (reward.type === 'data') {
    const bundle = dataBundleById(reward.bundleId)
    return bundle ? `${bundle.label} data` : 'Data bundle'
  }
  return '—'
}

export function rewardShortLabel(reward) {
  if (!reward?.enabled) return null
  if (reward.type === 'cash') return `${formatRewardMoney(reward.amount)}`
  if (reward.type === 'airtime') return `${formatRewardMoney(rewardAmountCedis(reward))} airtime`
  if (reward.type === 'data') return dataBundleById(reward.bundleId)?.label ?? 'Data'
  return rewardTypeMeta(reward.type)?.label ?? 'Reward'
}

export function rewardPlaceholders(reward) {
  if (!reward?.enabled) return []
  const amountSample = formatRewardMoney(rewardAmountCedis(reward)).replace('GH₵', 'GHS ')
  const bundle = dataBundleById(reward.bundleId)
  const items = [
    {
      id: 'rewardType',
      token: '{rewardType}',
      label: 'Reward type',
      sample: rewardTypeMeta(reward.type)?.label ?? 'Reward',
      aliases: ['{{reward_type}}', '{{rewardType}}'],
    },
  ]
  if (reward.type === 'cash' || reward.type === 'airtime') {
    items.push({
      id: 'rewardAmount',
      token: '{rewardAmount}',
      label: 'Reward amount',
      sample: amountSample.trim(),
      aliases: ['{{reward_amount}}', '{{rewardAmount}}'],
    })
  }
  if (reward.type === 'data') {
    items.push({
      id: 'bundleSize',
      token: '{bundleSize}',
      label: 'Bundle size',
      sample: bundle?.label ?? '1 GB',
      aliases: ['{{bundle_size}}', '{{bundleSize}}'],
    })
  }
  return items
}

export function insertRewardCopy(reward) {
  if (!reward?.enabled) return ''
  if (reward.type === 'cash') {
    return `We've sent you {rewardAmount} as a gift from {businessName}.`
  }
  if (reward.type === 'airtime') {
    return `Enjoy {rewardAmount} airtime from {businessName}.`
  }
  return `Enjoy a {bundleSize} data bundle from {businessName}.`
}

export function emptyReward() {
  return {
    enabled: false,
    type: '',
    amount: '',
    airtimePreset: '5',
    bundleId: '1gb',
    disbursementMethod: 'mobile_money',
  }
}

export function normalizeCampaignReward(reward) {
  if (!reward || !reward.enabled) return null
  const type = reward.type
  const amount = rewardAmountCedis(reward)
  const bundle = type === 'data' ? dataBundleById(reward.bundleId) : null
  return {
    enabled: true,
    type,
    amount: type === 'data' ? Number(bundle?.price) || 0 : amount,
    airtimePreset: reward.airtimePreset || '',
    bundleId: reward.bundleId || '',
    bundleLabel: bundle?.label || '',
    currency: rewardCurrency,
    disbursementMethod: reward.disbursementMethod || 'mobile_money',
    eligibleRecipients: reward.eligibleRecipients ?? null,
    estimatedCost: reward.estimatedCost ?? null,
    disbursed: reward.disbursed ?? null,
    pending: reward.pending ?? null,
    failed: reward.failed ?? null,
    notEligible: reward.notEligible ?? null,
    totalDisbursed: reward.totalDisbursed ?? null,
  }
}

export function formatEligibleCount(count) {
  return formatCount(Math.max(0, Number(count) || 0))
}
