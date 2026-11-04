// The API stores 233… and accepts the local 0… form. The screens always show and send the local form.
export function localPhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  const national = digits.startsWith('233') && digits.length === 12 ? digits.slice(3) : digits.replace(/^0/, '')
  return national.length === 9 ? `0${national}` : null
}

export function displayPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (/^233\d{9}$/.test(digits)) return `0${digits.slice(3)}`
  return String(value ?? '')
}

export function contactName(contact) {
  const name = `${contact?.firstName ?? ''} ${contact?.lastName ?? ''}`.trim()
  return name || 'Unnamed contact'
}

export function contactInitials(contact) {
  const letters = `${contact?.firstName ?? ''} ${contact?.lastName ?? ''}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  return letters || '#'
}

export function contactFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null

  return {
    id: String(data.id),
    groupId: data.contact_group_id == null ? '' : String(data.contact_group_id),
    importId: data.import_id == null && data.contact_import_id == null ? '' : String(data.import_id ?? data.contact_import_id),
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    email: data.email ?? '',
    gender: String(data.gender ?? '').toLowerCase(),
    phone: displayPhone(data.phone_number),
    dateOfBirth: data.date_of_birth || '',
    region: data.region ?? '',
    city: data.city ?? '',
    gpsAddress: data.gps_address ?? '',
    address: data.address ?? '',
    dnd: data.dnd_status === 'active',
    createdAt: data.created_at ?? '',
  }
}

// Matches the create and update body. Blank optional fields are omitted so an empty gender or
// region is not sent as an invalid value. Phone is always the local 0 + 9 digits.
export function contactBody(values) {
  const body = { phone_number: localPhone(values.phone) ?? String(values.phone ?? '').trim() }
  const text = {
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    gender: values.gender,
    region: values.region,
    city: values.city,
    gps_address: values.gpsAddress,
    address: values.address,
  }

  Object.entries(text).forEach(([key, value]) => {
    const trimmed = String(value ?? '').trim()
    if (trimmed) body[key] = trimmed
  })
  if (values.dateOfBirth) body.date_of_birth = values.dateOfBirth

  return body
}
