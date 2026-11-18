export const ctaTypes = [
  {
    id: 'link',
    label: 'Web link',
    description: 'Product page, offer page, or landing URL.',
    placeholder: 'https://example.com/offer',
    inputMode: 'url',
  },
  {
    id: 'phone',
    label: 'Phone number',
    description: 'Customer taps to call this number.',
    placeholder: '0241234567',
    inputMode: 'tel',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Opens a WhatsApp chat with your business.',
    placeholder: '233241234567',
    inputMode: 'tel',
  },
]

export const ctaTokens = ['{link}', '{ctaUrl}']

export function emptyCta() {
  return {
    enabled: false,
    placement: 'none',
    type: 'link',
    value: '',
    label: '',
    triggersReward: false,
  }
}

export function bodyHasCtaToken(body) {
  const text = String(body ?? '')
  return ctaTokens.some((token) => text.includes(token))
}

export function bodyHasWebLink(body) {
  return /https?:\/\/\S+/i.test(String(body ?? ''))
}

export function bodyContainsLink(body, url) {
  const address = String(url ?? '').trim().toLowerCase()
  if (address.length < 4) return false
  const text = String(body ?? '').toLowerCase()
  const bare = address.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return text.includes(address) || (bare.length > 4 && text.includes(bare))
}

export function ctaTypeMeta(type) {
  return ctaTypes.find((item) => item.id === type) ?? null
}

export function normalizeCampaignCta(cta, { hasReward = false } = {}) {
  if (!cta?.enabled) return null
  const type = ctaTypes.some((item) => item.id === cta.type) ? cta.type : 'link'
  return {
    enabled: true,
    type,
    value: String(cta.value ?? '').trim(),
    label: String(cta.label ?? '').trim(),
    triggersReward: Boolean(hasReward && cta.triggersReward),
  }
}

export function linkWithScheme(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export function formatCtaValue(cta) {
  if (!cta?.enabled || !cta.value) return '—'
  if (cta.type === 'whatsapp') {
    const digits = String(cta.value).replace(/\D/g, '')
    return digits ? `https://wa.me/${digits}` : cta.value
  }
  return linkWithScheme(cta.value)
}

export function formatCtaSummary(cta) {
  if (!cta?.enabled) return null
  const meta = ctaTypeMeta(cta.type)
  const value = formatCtaValue(cta)
  if (cta.label) return `${cta.label} · ${meta?.label ?? 'CTA'} · ${value}`
  return `${meta?.label ?? 'CTA'} · ${value}`
}

export function ctaInsertText(cta) {
  if (!cta?.enabled || !cta.value) return ''
  const value = formatCtaValue(cta)
  const label = String(cta.label ?? '').trim()
  if (label) return `${label}: ${value}`
  if (cta.type === 'phone') return `Call ${value}`
  if (cta.type === 'whatsapp') return `WhatsApp us: ${value}`
  return value
}

/** Body text as a contact would read it when the CTA field is used. */
export function messageWithCta(body, cta) {
  const text = String(body ?? '').trim()
  if (!cta || cta.placement !== 'field') return text
  const suffix = ctaInsertText({ ...cta, enabled: true, type: cta.type || 'link' })
  if (!suffix) return text
  if (bodyHasWebLink(text) || bodyContainsLink(text, cta.value)) return text
  return text ? `${text} ${suffix}` : suffix
}

export function validateCtaValue(cta) {
  const value = String(cta?.value ?? '').trim()
  if (!value) return 'Enter the CTA destination.'

  if (cta.type === 'link') {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`
    try {
      const url = new URL(withScheme)
      if (!url.hostname.includes('.')) return 'Enter a valid web link.'
    } catch {
      return 'Enter a valid web link.'
    }
    return ''
  }

  const digits = value.replace(/\D/g, '')
  if (digits.length < 9) {
    return cta.type === 'whatsapp' ? 'Enter a valid WhatsApp number.' : 'Enter a valid phone number.'
  }
  return ''
}
