import { campaignTypes, maxSegments, segmentCount } from '../model'

export function validateAudience(groups) {
  if (!groups.length) return { groupIds: 'Choose at least one contact group.' }
  if (groups.some((group) => group.breakdown.active < 1)) {
    return { groupIds: 'Every group needs at least one active contact.' }
  }
  return {}
}

export function validateMessage(values, now = new Date(), { nameError = 'Enter a campaign name.', senders = [] } = {}) {
  const errors = {}
  const body = values.body.trim()

  if (values.name.trim().length < 2) errors.name = nameError
  if (!campaignTypes.some((type) => type.id === values.type)) errors.type = 'Choose a type.'
  if (!senders.includes(values.sender)) errors.sender = 'Choose a sender.'
  if (!body) errors.body = 'Write the message.'
  else if (segmentCount(body) > maxSegments) errors.body = 'Keep the message within 6 segments.'

  if (values.when === 'later') {
    const sendAt = new Date(values.sendAt)
    if (!values.sendAt || Number.isNaN(sendAt.getTime())) errors.sendAt = 'Choose a date and time.'
    else if (sendAt.getTime() <= now.getTime()) errors.sendAt = 'Choose a time in the future.'
  }

  return errors
}
