const openStatuses = new Set(['active', 'scheduled', 'published', 'live', 'sending'])

function text(value) {
  if (value == null) return ''
  return String(value).trim()
}

function optionsFrom(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => text(item)).filter(Boolean)
}

export function publicSurveyFromApi(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const status = text(data.status).toLowerCase()
  const questions = (Array.isArray(data.questions) ? data.questions : [])
    .map((question, index) => {
      if (!question || typeof question !== 'object') return null
      const id = Number(question.id)
      const prompt = text(question.prompt)
      if (!Number.isInteger(id) || id <= 0 || !prompt) return null
      return {
        id,
        prompt,
        type: text(question.type).toLowerCase() || 'text',
        options: optionsFrom(question.options),
        required: question.required !== false,
        position: Number.isFinite(Number(question.position)) ? Number(question.position) : index,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.position - b.position || a.id - b.id)

  return {
    name: text(data.name) || 'Survey',
    intro: text(data.intro),
    status,
    acceptingResponses:
      typeof data.accepting_responses === 'boolean' ? data.accepting_responses : openStatuses.has(status),
    questions,
    reward: rewardNote(data.reward),
  }
}

function rewardNote(reward) {
  if (!reward || typeof reward !== 'object' || Array.isArray(reward)) return ''
  return text(reward.description) || text(reward.name) || text(reward.title) || text(reward.label)
}

export function isAnswered(question, value) {
  if (question.type === 'multiple_choice') return Array.isArray(value) && value.length > 0
  if (question.type === 'rating') return Number(value) >= 1 && Number(value) <= 5
  return text(value) !== ''
}

export function validatePublicSurvey(survey, answers) {
  const errors = {}
  survey.questions.forEach((question) => {
    const value = answers[question.id]
    if (question.type === 'number' && text(value) && !Number.isFinite(Number(text(value)))) {
      errors[question.id] = 'Enter a number.'
      return
    }
    if (!question.required || isAnswered(question, value)) return
    errors[question.id] =
      question.type === 'multiple_choice' || question.type === 'single_choice' || question.type === 'yes_no' || question.type === 'rating'
        ? 'Choose an answer.'
        : 'This question is required.'
  })
  return errors
}

function answerValue(question, value) {
  if (question.type === 'multiple_choice') return Array.isArray(value) ? value : []
  if (question.type === 'rating') return Number(value)
  if (question.type === 'number') return Number(text(value))
  return text(value)
}

export function publicSurveyAnswers(survey, answers) {
  return survey.questions
    .filter((question) => isAnswered(question, answers[question.id]))
    .map((question) => ({
      question_id: question.id,
      value: answerValue(question, answers[question.id]),
    }))
}
