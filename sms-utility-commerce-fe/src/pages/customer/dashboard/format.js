const count = new Intl.NumberFormat('en-GH')
const cedi = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatCount = (value) => count.format(value)
export const formatCedi = (value) => cedi.format(value).replace('GHS', 'GH₵').replace(/\s/g, '')
// Parses YYYY-MM-DD as a local date, so the day never shifts with the viewer's time zone.
export function parseISODate(iso) {
  const [year, month, date] = iso.split('-').map(Number)
  return new Date(year, month - 1, date)
}

export const formatDay = (iso) => day.format(parseISODate(iso))

export function greeting(date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
