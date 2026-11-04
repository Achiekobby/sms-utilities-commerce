const running = new Set(['queued', 'processing'])

export function contactImportFromApi(data) {
  if (!data || typeof data !== 'object' || !data.import_id) return null

  const status = String(data.status ?? 'queued')
  const progress = Number(data.progress)

  return {
    id: String(data.import_id),
    groupId: data.contact_group_id == null ? '' : String(data.contact_group_id),
    fileName: data.file_name ?? 'Upload',
    fileSize: Number(data.file_size) || 0,
    mimeType: data.mime_type ?? '',
    status,
    total: Number(data.total) || 0,
    inserted: Number(data.inserted) || 0,
    skipped: Number(data.skipped) || 0,
    failed: Number(data.failed) || 0,
    chunksExpected: Number(data.chunks_expected) || 0,
    chunksDone: Number(data.chunks_done) || 0,
    progress: Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0,
    message: typeof data.message === 'string' ? data.message : '',
    createdAt: data.created_at ?? '',
    updatedAt: data.updated_at ?? '',
    running: running.has(status),
  }
}

export function skippedRowFromApi(data) {
  if (!data || typeof data !== 'object') return null

  const id = data.id ?? data.row ?? data.row_number
  if (id == null) return null

  return {
    id: String(id),
    row: Number(data.row ?? data.row_number) || null,
    reason: String(data.reason ?? data.message ?? data.skip_reason ?? '').trim(),
    phone: data.phone_number ?? data.phone ?? '',
    firstName: data.first_name ?? data.firstName ?? '',
    lastName: data.last_name ?? data.lastName ?? '',
    email: data.email ?? '',
  }
}

export function pageResult(envelope, mapRow) {
  const rows = (Array.isArray(envelope?.data) ? envelope.data : []).map(mapRow).filter(Boolean)
  const pagination = envelope?.pagination ?? {}
  const lastPage = Number(pagination.last_page)

  return {
    rows,
    page: Number(pagination.current_page) || 1,
    perPage: Number(pagination.per_page) || 15,
    total: Number(pagination.total) || 0,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
  }
}

const stamp = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatStamp(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
  if (!match) return ''
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]))
  return stamp.format(date)
}
