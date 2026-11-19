import { bodyHasWebLink, emptyCta } from '../cta'
import { normalizeTriggerOffset } from '../model'
import { airtimePresets, dataBundles, emptyReward } from '../reward'

function clock(value) {
  const match = String(value ?? '').match(/^(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : null
}

function promotionDay(value) {
  const day = String(value ?? '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
}

function promotionCta(values) {
  if (values.cta?.placement !== 'field') return {}
  const raw = String(values.cta.value ?? '').trim()
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  const label = String(values.cta.label ?? '').trim()
  return {
    enabled: true,
    type: 'link',
    url,
    ...(label ? { label } : {}),
  }
}

function promotionSchedule(values) {
  if (values.when !== 'later') {
    return {
      send_at: null,
      send_time: null,
    }
  }

  const day = promotionDay(values.sendAt)
  const time = clock(values.sendTime) || '09:00'
  if (!day) {
    return {
      send_at: null,
      send_time: time,
    }
  }

  return {
    send_at: `${day} ${time}:00`,
    send_time: time,
  }
}

function occasionFields(values) {
  const birthday = values.occasionType === 'birthday'
  const triggerOffset = normalizeTriggerOffset(values.triggerOffset)
  const customDate = birthday || values.occasionType !== 'custom' ? null : promotionDay(values.customDate)
  const customOffset = triggerOffset === 'custom' ? Number(values.customOffsetDays) || null : null

  return {
    occasion_type: values.occasionType || null,
    // Birthdays match each contact's date_of_birth — never send custom_date.
    custom_date: customDate,
    trigger_offset: triggerOffset || 'on',
    custom_offset_days: customOffset,
    send_time: clock(values.sendTime),
    // Birthdays always repeat yearly.
    repeat_yearly: birthday ? true : values.repeatYearly === true,
    // Occasions never use send_at.
    send_at: null,
    cta: null,
  }
}

export function campaignDraftPayload(values) {
  const occasion = values.type === 'occasion'
  const shared = {
    name: values.name.trim(),
    type: values.type,
    contact_group_ids: values.groupIds.map((id) => Number(id)).filter((id) => Number.isInteger(id)),
    sender: values.sender,
    body: values.body.trim(),
  }

  if (occasion) return { ...shared, ...occasionFields(values) }

  return {
    ...shared,
    occasion_type: null,
    custom_date: null,
    trigger_offset: null,
    custom_offset_days: null,
    repeat_yearly: false,
    ...promotionSchedule(values),
    cta: promotionCta(values),
  }
}

function formCta(campaign) {
  const blank = emptyCta()
  const source = campaign.cta
  if (source?.enabled && source.value) {
    return {
      ...blank,
      enabled: true,
      placement: 'field',
      type: 'link',
      value: source.value,
      label: source.label || '',
    }
  }
  if (bodyHasWebLink(campaign.body)) return { ...blank, placement: 'message' }
  return blank
}

function promotionFormSchedule(campaign) {
  const raw = campaign.sendAt
  if (!raw) {
    return {
      when: 'now',
      sendAt: '',
      sendTime: clock(campaign.sendTime) || '09:00',
    }
  }

  const text = String(raw)
  const day = text.slice(0, 10)
  const fromStamp = text.match(/[T ](\d{2}):(\d{2})/)
  const sendTime = clock(campaign.sendTime) || (fromStamp ? `${fromStamp[1]}:${fromStamp[2]}` : '09:00')

  return {
    when: promotionDay(day) ? 'later' : 'now',
    sendAt: promotionDay(day) || '',
    sendTime,
  }
}

function rewardForm(reward) {
  const blank = emptyReward()
  if (!reward?.enabled) return blank
  const amount = reward.amount == null ? '' : String(reward.amount)
  const type = reward.type === 'money' ? 'cash' : reward.type
  const preset = airtimePresets.find((item) => item.id !== 'custom' && Number(item.amount) === Number(reward.amount))
  const bundle = dataBundles.find((item) => item.id === reward.bundleId || item.label === reward.bundleLabel)
  return {
    ...blank,
    enabled: true,
    rewardId: reward.rewardId ? String(reward.rewardId) : '',
    type: type || '',
    amount,
    network: reward.network || '',
    airtimePreset: type === 'airtime' ? preset?.id || String(reward.amount || '') || 'custom' : blank.airtimePreset,
    bundleId: bundle?.id || reward.bundleId || blank.bundleId,
    bundleLabel: reward.bundleLabel || bundle?.label || '',
    disbursementMethod: 'mobile_money',
  }
}

export function formValuesFromCampaign(campaign) {
  const occasion = campaign.type === 'occasion'
  const schedule = occasion
    ? {
        when: 'now',
        sendAt: '',
        sendTime: campaign.sendTime || '09:00',
      }
    : promotionFormSchedule(campaign)

  return {
    groupIds: (campaign.groups ?? []).map((group) => String(group.id)),
    name: campaign.name ?? '',
    type: campaign.type === 'occasion' || campaign.type === 'promotion' ? campaign.type : 'promotion',
    occasionType: occasion ? campaign.occasionType || 'birthday' : '',
    customDate:
      occasion && campaign.occasionType === 'custom' && campaign.customDate
        ? String(campaign.customDate).slice(0, 10)
        : '',
    triggerOffset: occasion ? normalizeTriggerOffset(campaign.triggerOffset) : 'on',
    customOffsetDays: campaign.customOffsetDays == null ? '3' : String(campaign.customOffsetDays),
    sendTime: occasion ? campaign.sendTime || '09:00' : schedule.sendTime,
    repeatYearly: occasion
      ? campaign.occasionType === 'birthday'
        ? true
        : campaign.repeatYearly === true
      : false,
    sender: campaign.sender || '',
    body: campaign.body ?? '',
    when: schedule.when,
    sendAt: schedule.sendAt,
    reward: rewardForm(campaign.reward),
    cta: occasion ? emptyCta() : formCta(campaign),
  }
}
