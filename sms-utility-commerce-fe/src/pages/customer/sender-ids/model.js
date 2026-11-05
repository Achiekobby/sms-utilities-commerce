export const senderStatuses = ['approved', 'pending', 'rejected']

export const statusLabel = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
}

const dayStamp = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatSenderDay(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return dayStamp.format(date)
}

export function senderIdFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.id == null) return null
  const status = String(data.status ?? '').toLowerCase()
  return {
    id: String(data.id),
    name: String(data.name ?? ''),
    status,
    approvedAt: data.approved_at == null ? '' : String(data.approved_at),
    rejectedAt: data.rejected_at == null ? '' : String(data.rejected_at),
    rejectionReason: data.rejection_reason == null ? '' : String(data.rejection_reason).trim(),
    createdAt: data.created_at == null ? '' : String(data.created_at),
  }
}

export function approvedSenderNames(records) {
  const names = records.filter((item) => item.status === 'approved').map((item) => item.name)
  if (!names.includes('UTILISMS')) return names
  return ['UTILISMS', ...names.filter((name) => name !== 'UTILISMS')]
}
