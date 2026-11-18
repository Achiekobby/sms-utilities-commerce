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
  }
}

export function surveyFromApi(data) {
  if (!data || typeof data !== 'object' || data.id == null) return null
  const questionList = Array.isArray(data.questions)
    ? data.questions
        .map((item, index) => {
          const question = questionFromApi(item)
          if (!question || question.serverId != null) return question
          return { ...question, id: `${question.id}-${index}` }
        })
        .filter(Boolean)
    : null
  const counted = questionList
    ? questionList.length
    : Number(data.questions_count ?? data.question_count ?? (typeof data.questions === 'number' ? data.questions : NaN))

  return {
    id: String(data.id),
    name: text(data.name) || text(data.title) || 'Survey',
    status: text(data.status),
    description: text(data.description) || text(data.intro),
    questionCount: Number.isFinite(counted) ? counted : null,
    questions: questionList,
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
