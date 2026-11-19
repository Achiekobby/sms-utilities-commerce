const choiceTypes = new Set(['single_choice', 'multiple_choice'])

function text(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function questionFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const serverId = Number(data.id)
  const hasServerId = Number.isInteger(serverId) && serverId > 0
  const type = text(data.type) || 'text'
  const options = Array.isArray(data.options) ? data.options.map((option) => text(option)) : []

  return {
    id: hasServerId ? `server-${serverId}` : `local-${text(data.prompt) || 'question'}`,
    serverId: hasServerId ? serverId : null,
    type,
    prompt: text(data.prompt),
    required: data.required == null ? true : Boolean(data.required),
    options: choiceTypes.has(type) && options.filter(Boolean).length < 2 ? [...options, '', ''].slice(0, Math.max(2, options.length)) : options,
    position: Number.isFinite(Number(data.position)) ? Number(data.position) : 0,
  }
}

export function questionsFromApi(data) {
  const list = Array.isArray(data) ? data : []
  return list
    .map((item, index) => {
      const question = questionFromApi(item)
      if (!question) return null
      if (question.serverId != null) return question
      return { ...question, id: `${question.id}-${index}` }
    })
    .filter(Boolean)
    .sort((a, b) => a.position - b.position)
}

function invitationBody(value) {
  return text(value).replace(/\s*\*\{\{link\}\}\*\s*$/i, '').replace(/\s*\{\{link\}\}\s*$/i, '').trim()
}

export function surveyFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null
  const questionList = Array.isArray(data.questions) ? questionsFromApi(data.questions) : null
  const counted = questionList
    ? questionList.length
    : Number(data.questions_count ?? data.question_count ?? (typeof data.questions === 'number' ? data.questions : NaN))
  const intro = text(data.intro)

  return {
    id: String(data.id),
    name: text(data.name) || text(data.title) || 'Survey',
    status: text(data.status),
    intro,
    description: text(data.description) || intro,
    body: invitationBody(data.body),
    sender: text(data.sender),
    sendAt: text(data.send_at),
    groupIds: Array.isArray(data.contact_group_ids) ? data.contact_group_ids.map((id) => String(id)) : [],
    surveyUrl: text(data.survey_url),
    questionCount: Number.isFinite(counted) ? counted : null,
    questions: questionList,
    activatedAt: text(data.activated_at),
    completedAt: text(data.completed_at),
    cancelledAt: text(data.cancelled_at),
    deleted: data.is_deleted === true,
    deletedAt: text(data.deleted_at),
    createdAt: text(data.created_at),
    updatedAt: text(data.updated_at),
  }
}

export function surveyStatusLabel(status) {
  const key = String(status ?? '').toLowerCase()
  if (!key) return '—'
  if (key === 'in_progress') return 'In progress'
  return key.charAt(0).toUpperCase() + key.slice(1).replaceAll('_', ' ')
}

function stamp(value) {
  const raw = text(value)
  if (!raw) return null
  return raw.includes('T') ? raw : raw.replace(' ', 'T')
}

function answerList(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return value
  return null
}

export function responseFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.id == null) return null
  return {
    id: String(data.id),
    surveyId: data.survey_id == null ? null : String(data.survey_id),
    contactId: data.contact_id == null ? null : String(data.contact_id),
    phone: text(data.phone),
    status: text(data.status),
    answers: answerList(data.answers ?? data.responses),
    createdAt: stamp(data.created_at),
    updatedAt: stamp(data.updated_at),
    completedAt: stamp(data.completed_at),
  }
}
