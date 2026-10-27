import { formatCount } from '../dashboard/format'

// 1 unit is GH₵0.001. One pesewa is 10 units, so the GH₵0.045 SMS rate is the integer 45.
export const unitsPerCedi = 1000
export const smsRateUnits = 45
export const minimumTopUpUnits = 5 * unitsPerCedi

export const topUpPresets = [20, 50, 100, 200, 500].map((cedis) => cedis * unitsPerCedi)

export const topUpChannels = [
  { id: 'mtn', label: 'MTN MoMo', gateway: 'hubtel', gatewayLabel: 'Hubtel' },
  { id: 'telecel', label: 'Telecel Cash', gateway: 'hubtel', gatewayLabel: 'Hubtel' },
  { id: 'at', label: 'AT Money', gateway: 'hubtel', gatewayLabel: 'Hubtel' },
  { id: 'card', label: 'Card', gateway: 'paystack', gatewayLabel: 'Paystack' },
]

export function channelById(id) {
  return topUpChannels.find((item) => item.id === id) ?? null
}

export function smsCostUnits({ segments, recipients }) {
  return Math.max(0, segments) * Math.max(0, recipients) * smsRateUnits
}

// Digits and one decimal point, with at most two pesewa places. Letters are dropped as they are typed.
export function sanitizeAmountInput(raw) {
  const cleaned = String(raw).replace(/[^\d.]/g, '')
  const dot = cleaned.indexOf('.')
  if (dot === -1) return cleaned
  const whole = cleaned.slice(0, dot)
  const frac = cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 2)
  return `${whole}.${frac}`
}

// Whole cedis and pesewas only. Thousandths stay 0 because a top-up is collected in pesewas.
export function parseCediInput(raw) {
  const cleaned = String(raw).replace(/,/g, '').trim()
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null
  const [whole, frac = ''] = cleaned.split('.')
  const pesewas = Number((frac + '00').slice(0, 2))
  return Number(whole) * unitsPerCedi + pesewas * 10
}

export function formatUnits(units) {
  const value = Number.isFinite(units) ? Math.trunc(units) : 0
  const negative = value < 0
  const abs = Math.abs(value)
  const whole = Math.floor(abs / unitsPerCedi)
  const frac = abs % unitsPerCedi
  const digits = frac % 10 === 0 ? 2 : 3
  const fraction = String(frac).padStart(3, '0').slice(0, digits)
  return `${negative ? '-' : ''}GH₵${formatCount(whole)}.${fraction}`
}
