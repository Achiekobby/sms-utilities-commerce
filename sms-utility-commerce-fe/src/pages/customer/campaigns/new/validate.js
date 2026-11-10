import { ctaTypes, validateCtaValue } from '../cta'
import { campaignTypes, maxSegments, segmentCount } from '../model'
import {
  dataBundleById,
  estimateRewardEligibility,
  parseRewardAmount,
  rewardCostUnits,
  rewardTypes,
} from '../reward'

export function validateCta(values) {
  if (values.type !== 'promotion') return {}
  const cta = values.cta
  if (!cta?.enabled) return {}

  const errors = {}
  if (!ctaTypes.some((item) => item.id === cta.type)) {
    errors.ctaType = 'Choose a CTA type.'
    return errors
  }
  const valueError = validateCtaValue(cta)
  if (valueError) errors.ctaValue = valueError
  return errors
}

export function validateAudience(groups) {
  if (!groups.length) return { groupIds: 'Choose at least one contact group.' }
  if (groups.some((group) => group.breakdown.active < 1)) {
    return { groupIds: 'Every group needs at least one active contact.' }
  }
  return {}
}

export function validateReward(values, { smsRecipients = 0, balance = 0 } = {}) {
  const reward = values.reward
  if (!reward?.enabled) return {}

  const errors = {}
  if (!rewardTypes.some((type) => type.id === reward.type && type.available)) {
    errors.rewardType = 'Choose a reward type.'
    return errors
  }

  if (reward.type === 'cash') {
    const amount = parseRewardAmount(reward.amount)
    if (amount == null || amount <= 0) errors.rewardAmount = 'Enter a reward amount greater than zero.'
  }

  if (reward.type === 'airtime') {
    if (reward.airtimePreset === 'custom') {
      const amount = parseRewardAmount(reward.amount)
      if (amount == null || amount <= 0) errors.rewardAmount = 'Enter a custom airtime amount.'
    } else if (!reward.airtimePreset) {
      errors.rewardAmount = 'Choose an airtime value.'
    }
  }

  if (reward.type === 'data' && !dataBundleById(reward.bundleId)) {
    errors.rewardBundle = 'Choose a data bundle.'
  }

  const eligibility = estimateRewardEligibility(smsRecipients)
  const cost = rewardCostUnits(reward, eligibility.eligible)
  if (cost > balance) {
    errors.rewardBalance = 'Your available balance is not enough to fund this reward.'
  }

  return errors
}

export function validateType(values) {
  if (!campaignTypes.some((type) => type.id === values.type)) {
    return { type: 'Choose a campaign type.' }
  }
  return {}
}

export function validateSchedule(values, now = new Date()) {
  const errors = {}

  if (values.type === 'occasion') {
    if (!values.occasionType) errors.occasionType = 'Choose an occasion type.'
    if (values.occasionType === 'custom') {
      if (!values.customDate) errors.customDate = 'Choose a custom date.'
      else {
        const date = new Date(`${values.customDate}T00:00:00`)
        if (Number.isNaN(date.getTime())) errors.customDate = 'Enter a valid date.'
      }
    }
    if (!values.triggerOffset) errors.triggerOffset = 'Choose when the message should send.'
    if (values.triggerOffset === 'custom') {
      const days = Number(values.customOffsetDays)
      if (!Number.isFinite(days) || days < 1) errors.customOffsetDays = 'Enter days before the occasion.'
    }
    if (!values.sendTime) errors.sendTime = 'Choose a send time.'
    return errors
  }

  if (values.when === 'later') {
    const sendAt = new Date(values.sendAt)
    if (!values.sendAt || Number.isNaN(sendAt.getTime())) errors.sendAt = 'Choose a date and time.'
    else if (sendAt.getTime() <= now.getTime()) errors.sendAt = 'Choose a time in the future.'
  }

  return errors
}

export function validateMessage(
  values,
  now = new Date(),
  { nameError = 'Enter a campaign name.', senders = [], requireName = true, requireType = true } = {},
) {
  const errors = {}
  const body = values.body.trim()

  if (requireName && values.name.trim().length < 2) errors.name = nameError
  if (requireType) {
    if (!campaignTypes.some((type) => type.id === values.type)) errors.type = 'Choose a type.'
  }
  if (!senders.includes(values.sender)) errors.sender = 'Choose a sender.'
  if (!body) errors.body = 'Write the message.'
  else if (segmentCount(body) > maxSegments) errors.body = 'Keep the message within 6 segments.'

  Object.assign(errors, validateCta(values))

  // Keep schedule validation available when MessageStep still owns when/sendAt (e.g. messages flow).
  if (values.when === 'later' && values.type !== 'occasion') {
    const sendAt = new Date(values.sendAt)
    if (!values.sendAt || Number.isNaN(sendAt.getTime())) errors.sendAt = 'Choose a date and time.'
    else if (sendAt.getTime() <= now.getTime()) errors.sendAt = 'Choose a time in the future.'
  }

  return errors
}
