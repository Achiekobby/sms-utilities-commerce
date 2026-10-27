export const senderStatuses = ['approved', 'pending', 'rejected']

export const statusLabel = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
}

export function approvedSenderNames(records) {
  const names = records.filter((item) => item.status === 'approved').map((item) => item.name)
  if (!names.includes('UTILISMS')) return names
  return ['UTILISMS', ...names.filter((name) => name !== 'UTILISMS')]
}
