import { fieldErrors } from '../auth/session'
import { labelize, monthSpan, money } from '../clients/clientModel'

export { labelize, monthSpan, money }

export const emptyPlanFilters = {
  status: '',
  featured: '',
}

export function blankDetails() {
  return [
    { months: '1', units: '', price: '' },
    { months: '2', units: '', price: '' },
    { months: '3', units: '', price: '' },
  ]
}

export function valuesFromPlan(plan) {
  const details = Array.isArray(plan?.details) && plan.details.length
    ? plan.details.map((row) => ({
        months: row?.months == null ? '' : String(row.months),
        units: row?.units == null ? '' : String(row.units),
        price: row?.price == null ? '' : String(row.price),
      }))
    : blankDetails()

  return {
    name: plan?.name ?? '',
    status: plan?.status === 'inactive' ? 'inactive' : 'active',
    featured: Boolean(plan?.is_featured),
    details,
  }
}

export function planSignature(values) {
  return JSON.stringify({
    name: String(values?.name ?? '').trim(),
    status: values?.status === 'inactive' ? 'inactive' : 'active',
    featured: Boolean(values?.featured),
    details: (values?.details ?? []).map((row) => ({
      months: String(row.months ?? '').trim(),
      units: String(row.units ?? '').trim(),
      price: String(row.price ?? '').trim(),
    })),
  })
}

function wholeNumber(value) {
  const text = String(value ?? '').trim()
  if (!/^\d+$/.test(text)) return null
  return Number(text)
}

function priceNumber(value) {
  const text = String(value ?? '').trim()
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null
  return Number(text)
}

export function validatePlan(values) {
  const errors = {}
  const name = String(values?.name ?? '').trim()
  if (!name) errors.name = 'Enter a plan name.'
  else if (name.length > 80) errors.name = 'Use 80 characters or fewer.'

  const details = Array.isArray(values?.details) ? values.details : []
  if (!details.length) errors.details = 'Add at least one duration.'

  const seen = new Set()
  const rows = {}
  details.forEach((row, index) => {
    const months = wholeNumber(row.months)
    const units = wholeNumber(row.units)
    const price = priceNumber(row.price)
    const rowErrors = {}
    if (months == null || months < 1 || months > 36) rowErrors.months = 'Use 1 to 36 months.'
    else if (seen.has(months)) rowErrors.months = 'Each duration must be different.'
    else seen.add(months)
    if (units == null || units < 1) rowErrors.units = 'Enter the SMS units.'
    if (price == null || price <= 0) rowErrors.price = 'Enter a price greater than 0.'
    if (Object.keys(rowErrors).length) rows[index] = rowErrors
  })
  if (Object.keys(rows).length) errors.rows = rows
  return errors
}

function detailPayload(values) {
  return (values.details ?? []).map((row) => ({
    months: Number(row.months),
    units: Number(row.units),
    price: Number(row.price),
  }))
}

export function planCreateBody(values) {
  return {
    name: values.name.trim(),
    details: detailPayload(values),
  }
}

export function planUpdateBody(values) {
  return {
    name: values.name.trim(),
    details: detailPayload(values),
    status: values.status === 'inactive' ? 'inactive' : 'active',
    is_featured: values.featured ? 1 : 0,
  }
}

export function planFieldErrors(error) {
  const raw = fieldErrors(error)
  const errors = {}
  const rows = {}
  Object.entries(raw).forEach(([key, message]) => {
    if (key === 'name' || key === 'status' || key === 'details') {
      errors[key] = message
      return
    }
    if (key === 'is_featured') {
      errors.featured = message
      return
    }
    const match = /^details\.(\d+)\.(months|units|price)$/.exec(key)
    if (!match) return
    const index = Number(match[1])
    rows[index] = { ...(rows[index] ?? {}), [match[2]]: message }
  })
  if (Object.keys(rows).length) errors.rows = rows
  return errors
}

export function activeFilterCount(filters) {
  return Object.values(filters).filter(Boolean).length
}

export function describePlanFilters(filters) {
  const chips = []
  if (filters.status) chips.push({ key: 'status', label: labelize(filters.status) })
  if (filters.featured === 'featured') chips.push({ key: 'featured', label: 'Featured' })
  if (filters.featured === 'standard') chips.push({ key: 'featured', label: 'Not featured' })
  return chips
}

export function planMatches(plan, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return String(plan?.name ?? '').toLowerCase().includes(needle)
}

export function planMatchesFilters(plan, filters) {
  if (!filters) return true
  if (filters.status && plan?.status !== filters.status) return false
  if (filters.featured === 'featured' && !plan?.is_featured) return false
  if (filters.featured === 'standard' && plan?.is_featured) return false
  return true
}

export function formatUnits(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value ?? '')
  return number.toLocaleString('en-GH')
}
