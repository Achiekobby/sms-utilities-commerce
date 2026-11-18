import { bodyHasWebLink, emptyCta } from '../cta'
import { airtimePresets, dataBundles, emptyReward } from '../reward'

function clock(value) {
  const match = String(value ?? '').match(/^(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : null
}

function promotionDate(value) {
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

function occasionFields(values) {
  const customDate = values.occasionType === 'custom' ? values.customDate || null : null
  const customOffset = values.triggerOffset === 'custom' ? Number(values.customOffsetDays) || null : null
  return {
    occasion_type: values.occasionType || null,
    custom_date: customDate,
    trigger_offset: values.triggerOffset || 'on',
    custom_offset_days: customOffset,
    send_time: clock(values.sendTime),
    repeat_yearly: values.repeatYearly !== false,
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
    send_time: null,
    repeat_yearly: false,
    send_at: values.when === 'later' ? promotionDate(values.sendAt) : null,
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

function promotionSendAt(value) {
  if (!value) return ''
  const day = String(value).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : ''
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
  const sendAt = occasion ? '' : promotionSendAt(campaign.sendAt)
  return {
    groupIds: (campaign.groups ?? []).map((group) => String(group.id)),
    name: campaign.name ?? '',
    type: campaign.type === 'occasion' || campaign.type === 'promotion' ? campaign.type : 'promotion',
    occasionType: occasion ? campaign.occasionType || 'birthday' : '',
    customDate: campaign.customDate ? String(campaign.customDate).slice(0, 10) : '',
    triggerOffset: occasion ? campaign.triggerOffset || 'on' : 'on',
    customOffsetDays: campaign.customOffsetDays == null ? '3' : String(campaign.customOffsetDays),
    sendTime: occasion ? campaign.sendTime || '09:00' : '09:00',
    repeatYearly: occasion ? campaign.repeatYearly === true : false,
    sender: campaign.sender || '',
    body: campaign.body ?? '',
    when: sendAt ? 'later' : 'now',
    sendAt,
    reward: rewardForm(campaign.reward),
    cta: occasion ? emptyCta() : formCta(campaign),
  }
}
