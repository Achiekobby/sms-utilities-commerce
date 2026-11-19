import { bodyContainsLink, bodyHasCtaToken, bodyHasWebLink, validateCtaValue } from '../cta'
import { campaignTypes, maxSegments, normalizeTriggerOffset, segmentCount } from '../model'
import { rewardTypes } from '../reward'

export function validateCta(values) {
  if (values.type !== 'promotion') return {}
  const cta = values.cta
  const placement = cta?.placement || 'none'
  const body = String(values.body ?? '')
  const errors = {}

  if (placement === 'field') {
    const valueError = validateCtaValue({ ...cta, type: 'link' })
    if (valueError) errors.ctaValue = valueError
    else if (bodyHasWebLink(body) || bodyContainsLink(body, cta.value)) {
      errors.ctaValue = 'Remove the link from the message, or switch to writing the link in the message.'
    } else if (bodyHasCtaToken(body)) {
      errors.body = 'Remove {link} and {ctaUrl}. The CTA is added at the end of the message.'
    }
    return errors
  }

  if (placement === 'message') {
    if (bodyHasCtaToken(body)) {
      errors.body = 'Remove {link} and {ctaUrl}, and paste the real link instead.'
    } else if (!bodyHasWebLink(body)) {
      errors.body = 'Paste the link into the message.'
    }
    return errors
  }

  if (bodyHasCtaToken(body)) {
    errors.body = 'Remove {link} and {ctaUrl} from the message.'
  } else if (bodyHasWebLink(body)) {
    errors.body = 'This message already includes a link. Choose “Link in the message”, or remove it.'
  }
  return errors
}

export function validateAudience(groups) {
  if (!groups.length) return { groupIds: 'Choose at least one contact group.' }
  if (groups.some((group) => group.breakdown.active < 1)) {
    return { groupIds: 'Every group needs at least one active contact.' }
  }
  return {}
}

export function validateReward(values) {
  const reward = values.reward
  if (!reward?.enabled) return {}

  const errors = {}
  const rewardId = Number(reward.rewardId)
  if (!Number.isInteger(rewardId) || rewardId < 1) {
    errors.rewardId = 'Choose a reward from your catalog.'
    return errors
  }

  if (reward.type && !rewardTypes.some((type) => type.id === reward.type && type.available)) {
    errors.rewardType = 'Choose a valid reward.'
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
    const triggerOffset = normalizeTriggerOffset(values.triggerOffset)
    if (!triggerOffset) errors.triggerOffset = 'Choose when the message should send.'
    if (triggerOffset === 'custom') {
      const days = Number(values.customOffsetDays)
      if (!Number.isFinite(days) || days < 1) errors.customOffsetDays = 'Enter days before the occasion.'
    }
    if (!values.sendTime) errors.sendTime = 'Choose a send time.'
    return errors
  }

  if (values.when === 'later') {
    Object.assign(errors, validatePromotionSchedule(values, now))
  }

  return errors
}

function clock(value) {
  const match = String(value ?? '').match(/^(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : null
}

function validatePromotionSchedule(values, now = new Date()) {
  const errors = {}
  const day = String(values.sendAt ?? '').slice(0, 10)
  const time = clock(values.sendTime)
  const date = /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T00:00:00`) : null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (!date || Number.isNaN(date.getTime())) errors.sendAt = 'Choose a date.'
  else if (date < today) errors.sendAt = 'Choose today or a future date.'

  if (!time) errors.sendTime = 'Choose a send time.'
  else if (date && !Number.isNaN(date.getTime()) && date.getTime() === today.getTime()) {
    const [hours, minutes] = time.split(':').map(Number)
    const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
    if (scheduled <= now) errors.sendTime = 'Choose a time later than now.'
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
    Object.assign(errors, validatePromotionSchedule(values, now))
  }

  return errors
}
