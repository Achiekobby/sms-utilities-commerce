let sequence = 0

export const questionTypes = [
  { id: 'rating', label: 'Rating', hint: 'Score from 1 to 5' },
  { id: 'single_choice', label: 'Single choice', hint: 'Pick one option' },
  { id: 'multiple_choice', label: 'Multiple choice', hint: 'Pick any that apply' },
  { id: 'text', label: 'Short answer', hint: 'One line of text' },
  { id: 'long_text', label: 'Paragraph', hint: 'A longer reply' },
  { id: 'yes_no', label: 'Yes or no', hint: 'A simple decision' },
  { id: 'number', label: 'Number', hint: 'A figure' },
]

const choiceTypes = new Set(['single_choice', 'multiple_choice'])

export function isChoiceType(type) {
  return choiceTypes.has(type)
}

export function questionTypeMeta(type) {
  return questionTypes.find((item) => item.id === type) ?? questionTypes[0]
}

export function newQuestion(type = 'rating') {
  sequence += 1
  return {
    id: `q-${Date.now()}-${sequence}`,
    serverId: null,
    type,
    prompt: '',
    required: true,
    options: isChoiceType(type) ? ['', ''] : [],
  }
}

export const surveyInvitation = 'Please take our survey: {{link}}'

export const emptySurvey = {
  name: '',
  intro: '',
  groupIds: [],
  sender: '',
  questions: [],
}

export function withQuestionType(question, type) {
  if (!isChoiceType(type)) return { ...question, type }
  const options = [...question.options]
  while (options.length < 2) options.push('')
  return { ...question, type, options }
}

function filledOptions(question) {
  return question.options.map((option) => option.trim()).filter(Boolean)
}

export function questionPayload(question) {
  const item = {
    prompt: question.prompt.trim(),
    type: question.type,
    required: Boolean(question.required),
  }
  if (isChoiceType(question.type)) item.options = filledOptions(question)
  return item
}

export function questionsPayload(questions) {
  return {
    questions: questions.map((question) => {
      const item = questionPayload(question)
      const serverId = Number(question.serverId)
      if (Number.isInteger(serverId) && serverId > 0) item.id = serverId
      return item
    }),
  }
}

export function surveyPayload(values) {
  return {
    name: values.name.trim(),
    intro: values.intro.trim(),
    body: surveyInvitation,
    contact_group_ids: values.groupIds.map((id) => Number(id)).filter((id) => Number.isInteger(id)),
    sender: values.sender,
    questions: values.questions.map(questionPayload),
  }
}

function questionErrors(question) {
  const errors = {}
  if (!question.prompt.trim()) errors.prompt = 'Write the question.'
  if (isChoiceType(question.type) && filledOptions(question).length < 2) {
    errors.options = 'Add at least two options.'
  }
  return errors
}

export function validateQuestions(questions) {
  const errors = {}
  if (!questions.length) errors.questions = 'Add at least one question.'
  const byId = {}
  questions.forEach((question) => {
    const found = questionErrors(question)
    if (Object.keys(found).length) byId[question.id] = found
  })
  if (Object.keys(byId).length) errors.questionsById = byId
  return errors
}

export function validateSurvey(values, { senders = [] } = {}) {
  const errors = {
    ...validateQuestions(values.questions),
  }
  if (!values.name.trim()) errors.name = 'Name the survey.'
  if (!values.intro.trim()) errors.intro = 'Add a short introduction.'
  if (!values.groupIds.length) errors.groupIds = 'Choose at least one contact group.'
  if (!senders.includes(values.sender)) errors.sender = 'Choose a sender.'
  return errors
}

export function answerReady(question, answer) {
  if (!question.required) return true
  if (question.type === 'rating') return Number(answer) >= 1 && Number(answer) <= 5
  if (question.type === 'multiple_choice') return Array.isArray(answer) && answer.length > 0
  if (question.type === 'yes_no') return answer === 'yes' || answer === 'no'
  if (question.type === 'number') return String(answer ?? '').trim() !== '' && Number.isFinite(Number(answer))
  return String(answer ?? '').trim() !== ''
}
