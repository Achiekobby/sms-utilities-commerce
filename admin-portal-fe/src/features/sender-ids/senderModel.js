export const senderStatuses = [
  { value: '', label: 'Any status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function senderStatusTone(status) {
  if (status === 'approved') return 'good'
  if (status === 'rejected') return 'bad'
  if (status === 'pending') return 'wait'
  return 'neutral'
}

export function decisionWhen(record) {
  if (record?.status === 'rejected') return record.rejected_at
  if (record?.status === 'approved') return record.approved_at
  return ''
}
