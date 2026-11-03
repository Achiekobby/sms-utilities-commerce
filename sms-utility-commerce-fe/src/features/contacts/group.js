function today() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function dayFrom(value) {
  const day = String(value ?? '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : today()
}

export function contactGroupFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null

  return {
    id: String(data.id),
    name: data.name ?? '',
    description: data.description ?? '',
    count: Number(data.count_of_contacts) || 0,
    createdAt: dayFrom(data.created_at),
    updatedAt: dayFrom(data.updated_at || data.created_at),
    deletedAt: data.deleted_at || null,
    archivedAt: data.deleted_at ? dayFrom(data.deleted_at) : null,
  }
}

const count = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0
}

// GET /api/client/contact-groups/stats
export function contactStatsFromApi(data) {
  if (!data || typeof data !== 'object') return null

  return {
    totalGroups: count(data.total_groups),
    totalContacts: count(data.total_contacts),
    newThisMonth: count(data.new_this_month),
    archivedGroups: count(data.archived_groups),
  }
}
