import { formatCount } from '../customer/dashboard/format'

export const NON_EXPIRY_PERIOD = 0

const nameRank = {
  brass: 1,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
}

const accents = {
  brass: '#B45309',
  bronze: '#008859',
  silver: '#0B63F6',
  gold: '#8EC1FF',
  platinum: '#0B1F5B',
}

function rankName(name) {
  return nameRank[String(name ?? '').trim().toLowerCase()] ?? 50
}

function isNonExpiryDetail(row) {
  return Boolean(row?.non_expiry) || Number(row?.months) === NON_EXPIRY_PERIOD
}

export function detailForPeriod(plan, period) {
  const details = Array.isArray(plan?.details) ? plan.details : []
  const value = Number(period)

  if (value === NON_EXPIRY_PERIOD) {
    return details.find((row) => isNonExpiryDetail(row)) ?? null
  }

  return (
    details.find((row) => Number(row.months) === value && !isNonExpiryDetail(row)) ??
    details.find((row) => Number(row.months) === value) ??
    null
  )
}

function oneMonthDetail(plan) {
  return detailForPeriod(plan, 1) ?? (Array.isArray(plan?.details) ? plan.details.find((row) => !isNonExpiryDetail(row)) : null)
}

export function billingPeriodsFromPlans(plans) {
  const periods = new Set()
  let hasNonExpiry = false

  plans.forEach((plan) => {
    ;(Array.isArray(plan?.details) ? plan.details : []).forEach((row) => {
      if (isNonExpiryDetail(row)) {
        hasNonExpiry = true
        return
      }
      const value = Number(row.months)
      if (Number.isFinite(value) && value > 0) periods.add(value)
    })
  })

  const list = [...periods].sort((a, b) => a - b)
  if (hasNonExpiry) list.push(NON_EXPIRY_PERIOD)
  return list.length ? list : [1]
}

/** @deprecated use billingPeriodsFromPlans */
export function billingMonthsFromPlans(plans) {
  return billingPeriodsFromPlans(plans)
}

export function durationLabel(period) {
  const value = Number(period)
  if (value === NON_EXPIRY_PERIOD) return 'Non-expiry'
  if (value === 1) return '1 month'
  return `${value} months`
}

export function isNonExpiryPeriod(period) {
  return Number(period) === NON_EXPIRY_PERIOD
}

export function savingsPercent(plan, period) {
  const selected = detailForPeriod(plan, period)
  const monthly = oneMonthDetail(plan)
  if (!selected || !monthly) return 0

  const selectedUnits = Number(selected.units) || 0
  const selectedPrice = Number(selected.price) || 0
  const monthlyUnits = Number(monthly.units) || 0
  const monthlyPrice = Number(monthly.price) || 0
  if (!selectedUnits || !selectedPrice || !monthlyUnits || !monthlyPrice) return 0

  if (isNonExpiryPeriod(period) || isNonExpiryDetail(selected)) {
    const selectedRate = selectedPrice / selectedUnits
    const monthlyRate = monthlyPrice / monthlyUnits
    if (selectedRate >= monthlyRate) return 0
    return Math.round(((monthlyRate - selectedRate) / monthlyRate) * 100)
  }

  const months = Number(period)
  if (months <= 1) return 0
  const full = monthlyPrice * months
  if (full <= 0 || selectedPrice >= full) return 0
  return Math.round(((full - selectedPrice) / full) * 100)
}

export function maxSavingsPercent(plans, period) {
  return plans.reduce((max, plan) => Math.max(max, savingsPercent(plan, period)), 0)
}

function audienceFor(name) {
  const key = String(name ?? '').trim().toLowerCase()
  if (key === 'brass' || key === 'bronze') return 'A light start for occasional messaging.'
  if (key === 'silver') return 'For growing inboxes and regular campaigns.'
  if (key === 'gold') return 'For teams sending every week with more volume.'
  if (key === 'platinum') return 'For high-volume senders who need headroom.'
  return 'SMS units and billing options that match your send volume.'
}

function standoutFor(plan, period) {
  const selected = detailForPeriod(plan, period) ?? oneMonthDetail(plan)
  const units = Number(selected?.units) || 0
  const save = savingsPercent(plan, period)

  if (isNonExpiryPeriod(period) || isNonExpiryDetail(selected)) {
    return {
      title: 'Units never expire',
      text: `Buy ${formatCount(units)} SMS units once and use them whenever you need them.`,
    }
  }

  if (save > 0) {
    return {
      title: `Save about ${save}% vs monthly`,
      text: `Lock in ${formatCount(units)} SMS units across ${durationLabel(period)}.`,
    }
  }

  return {
    title: `${formatCount(units)} SMS units`,
    text: 'Use them across campaigns, reminders, and customer updates.',
  }
}

function perksFor(plan, period) {
  const selected = detailForPeriod(plan, period) ?? oneMonthDetail(plan)
  const units = Number(selected?.units) || 0
  const price = Number(selected?.price) || 0
  const nonExpiry = isNonExpiryPeriod(period) || isNonExpiryDetail(selected)
  const monthly = oneMonthDetail(plan)
  const rate =
    selected && Number(selected.units) > 0
      ? Number(selected.price) / Number(selected.units)
      : monthly && Number(monthly.units) > 0
        ? Number(monthly.price) / Number(monthly.units)
        : null

  return [
    nonExpiry
      ? `${formatCount(units)} SMS units with no expiry`
      : `${formatCount(units)} SMS units for ${durationLabel(period)}`,
    price > 0 ? `GH₵${formatCount(price)} package price` : 'Included with your subscription',
    rate != null ? `About GH₵${rate.toFixed(3)} per SMS unit` : 'Competitive SMS unit rate',
    nonExpiry ? 'Use your units anytime — they do not expire' : 'Billed for the selected package duration',
    'Pay securely at checkout (MoMo or card)',
    'Delivery status for every message',
  ]
}

function ctaFor(name) {
  const label = String(name ?? '').trim() || 'plan'
  return `Choose ${label}`
}

export function mapClientPlans(rawPlans = []) {
  const active = (Array.isArray(rawPlans) ? rawPlans : []).filter(
    (plan) => String(plan?.status ?? 'active').toLowerCase() === 'active',
  )

  const sorted = [...active].sort((a, b) => {
    const rank = rankName(a.name) - rankName(b.name)
    if (rank !== 0) return rank
    const aPrice = Number(oneMonthDetail(a)?.price) || 0
    const bPrice = Number(oneMonthDetail(b)?.price) || 0
    return aPrice - bPrice
  })

  const featuredId =
    sorted.find((plan) => plan.is_featured)?.id ??
    sorted.find((plan) => String(plan.name).toLowerCase() === 'gold')?.id ??
    sorted[Math.min(2, Math.max(0, sorted.length - 1))]?.id

  return sorted.map((plan) => {
    const key = String(plan.name ?? '').trim().toLowerCase()
    const monthly = oneMonthDetail(plan)
    const units = Number(monthly?.units) || 0
    const price = Number(monthly?.price) || 0
    const rate = units > 0 ? price / units : null

    return {
      id: String(plan.id),
      name: plan.name,
      audience: audienceFor(plan.name),
      details: Array.isArray(plan.details) ? plan.details : [],
      featured: plan.id === featuredId,
      accent: accents[key] ?? '#0B63F6',
      cta: ctaFor(plan.name),
      intro: 'What you get',
      rate: rate != null ? `GH₵${rate.toFixed(3)}` : '—',
      raw: plan,
    }
  })
}

export function planPrice(plan, period) {
  const selected = detailForPeriod(plan, period) ?? oneMonthDetail(plan)
  const months =
    selected?.months == null
      ? Number(period)
      : Number(selected.months)

  return {
    price: Number(selected?.price) || 0,
    units: Number(selected?.units) || 0,
    months: Number.isFinite(months) ? months : 1,
    nonExpiry: isNonExpiryDetail(selected) || isNonExpiryPeriod(period),
  }
}

function markBest(values, { prefer = 'max' } = {}) {
  const scores = values.map((item) => item.score)
  const valid = scores.filter((score) => Number.isFinite(score))
  if (!valid.length) return values.map(({ text }) => ({ text, best: false }))

  const target = prefer === 'min' ? Math.min(...valid) : Math.max(...valid)
  return values.map(({ text, score }) => ({
    text,
    best: Number.isFinite(score) && score === target,
  }))
}

export function comparisonSections(plans, period) {
  if (!plans.length) return []

  const priced = plans.map((plan) => planPrice(plan, period))

  const units = markBest(
    priced.map((selected) => ({
      text: formatCount(selected.units),
      score: selected.units,
    })),
  )

  const packagePrice = markBest(
    priced.map((selected) => ({
      text: `GH₵${formatCount(selected.price)}`,
      score: selected.price,
    })),
    { prefer: 'min' },
  )

  const monthlyOrExpiry = isNonExpiryPeriod(period)
    ? priced.map((selected) => ({
        text: selected.nonExpiry ? 'Never expires' : 'Timed package',
        best: Boolean(selected.nonExpiry),
      }))
    : markBest(
        priced.map((selected) => {
          const monthly = selected.months > 0 ? selected.price / selected.months : selected.price
          return {
            text: `GH₵${monthly % 1 === 0 ? formatCount(monthly) : monthly.toFixed(2)}`,
            score: monthly,
          }
        }),
        { prefer: 'min' },
      )

  const rates = markBest(
    priced.map((selected) => {
      if (!selected.units) return { text: '—', score: Number.POSITIVE_INFINITY }
      const rate = selected.price / selected.units
      return {
        text: `GH₵${rate.toFixed(3)}`,
        score: rate,
      }
    }),
    { prefer: 'min' },
  )

  const savings = markBest(
    plans.map((plan) => {
      const save = savingsPercent(plan, period)
      return {
        text: save > 0 ? `${save}%` : '—',
        score: save,
      }
    }),
  )

  const billing = plans.map((plan) => {
    const options = []
    const seen = new Set()
    ;(plan.details ?? []).forEach((row) => {
      if (isNonExpiryDetail(row)) {
        if (!seen.has(NON_EXPIRY_PERIOD)) {
          seen.add(NON_EXPIRY_PERIOD)
          options.push(NON_EXPIRY_PERIOD)
        }
        return
      }
      const months = Number(row.months)
      if (Number.isFinite(months) && months > 0 && !seen.has(months)) {
        seen.add(months)
        options.push(months)
      }
    })
    options.sort((a, b) => {
      if (a === NON_EXPIRY_PERIOD) return 1
      if (b === NON_EXPIRY_PERIOD) return -1
      return a - b
    })
    return {
      text: options.length ? options.map(durationLabel).join(' · ') : '—',
      best: options.includes(NON_EXPIRY_PERIOD),
    }
  })

  return [
    {
      id: 'package',
      title: 'Package',
      description: 'What you get for the selected billing period.',
      rows: [
        {
          id: 'units',
          label: 'SMS units',
          hint: 'Total units included in this package.',
          values: units,
        },
        {
          id: 'price',
          label: 'Package price',
          hint: 'Amount billed for the selected period.',
          values: packagePrice,
        },
        {
          id: 'monthly',
          label: isNonExpiryPeriod(period) ? 'Expiry' : 'Effective monthly',
          hint: isNonExpiryPeriod(period)
            ? 'Whether unused units expire after purchase.'
            : 'Package price spread across the selected months.',
          values: monthlyOrExpiry,
        },
        {
          id: 'rate',
          label: 'Rate per unit',
          hint: 'Approximate cost for each SMS unit in this package.',
          values: rates,
        },
        {
          id: 'savings',
          label: isNonExpiryPeriod(period) ? 'Saving vs monthly' : 'Saving vs 1 month',
          hint: 'Compared with buying the one-month package instead.',
          values: savings,
        },
      ],
    },
    {
      id: 'flexibility',
      title: 'Flexibility',
      description: 'How you can buy and use units over time.',
      rows: [
        {
          id: 'billing',
          label: 'Available packages',
          hint: 'Durations offered for this plan.',
          values: billing,
        },
        {
          id: 'wallet',
          label: 'Wallet top-up',
          hint: 'Fund sends beyond your package units.',
          values: plans.map(() => ({ text: 'MoMo or card', best: false })),
        },
        {
          id: 'delivery',
          label: 'Delivery status',
          hint: 'Track every message after it leaves.',
          values: plans.map(() => ({ text: true, best: true })),
        },
      ],
    },
  ]
}

/** @deprecated use comparisonSections */
export function comparisonRows(plans, period) {
  return comparisonSections(plans, period).flatMap((section) =>
    section.rows.map((row) => ({
      label: row.label,
      values: row.values.map((value) => value.text),
    })),
  )
}

export function planPerks(plan, period) {
  return perksFor(plan, period)
}

export function planStandout(plan, period) {
  return standoutFor(plan, period)
}
