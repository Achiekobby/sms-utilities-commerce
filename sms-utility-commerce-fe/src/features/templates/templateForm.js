export const createTypes = [
  { id: 'quick_sms', label: 'Quick SMS', hint: 'Plain SMS with no personalization required.' },
  { id: 'bulk_sms', label: 'Bulk SMS', hint: 'Group SMS that can use contact placeholders.' },
  { id: 'campaign_promotion', label: 'Promotion campaign', hint: 'Sales or promo template with optional CTA.' },
  { id: 'campaign_occasion', label: 'Occasion campaign', hint: 'Birthday, anniversary, holiday, or custom date.' },
  { id: 'survey', label: 'Survey', hint: 'Intro SMS plus structured survey questions.' },
]

export const occasionTypes = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'holiday', label: 'Holiday' },
  { id: 'custom', label: 'Custom' },
]

export const ctaKinds = [
  { id: 'none', label: 'No CTA' },
  { id: 'link', label: 'Link' },
  { id: 'ussd', label: 'USSD' },
  { id: 'phone', label: 'Phone' },
]

export const questionTypes = [
  { id: 'rating', label: 'Rating', needsOptions: false },
  { id: 'yes_no', label: 'Yes / No', needsOptions: false },
  { id: 'single_choice', label: 'Single choice', needsOptions: true },
  { id: 'multiple_choice', label: 'Multiple choice', needsOptions: true },
  { id: 'number', label: 'Number', needsOptions: false },
  { id: 'text', label: 'Short text', needsOptions: false },
  { id: 'long_text', label: 'Long text', needsOptions: false },
]

export const bodyPlaceholders = [
  { id: 'first_name', token: '{first_name}', label: 'First name' },
  { id: 'full_name', token: '{full_name}', label: 'Full name' },
  { id: 'city', token: '{city}', label: 'City' },
  { id: 'region', token: '{region}', label: 'Region' },
  { id: 'cta_link', token: '{cta_link}', label: 'CTA link' },
  { id: 'survey_link', token: '{survey_link}', label: 'Survey link' },
]

/** Same contact tokens as promotion campaigns. The survey link is added automatically. */
export const surveyMessagePlaceholders = [
  { id: 'firstName', token: '{firstName}', label: 'First name' },
  { id: 'lastName', token: '{lastName}', label: 'Last name' },
  { id: 'fullName', token: '{fullName}', label: 'Full name' },
  { id: 'businessName', token: '{businessName}', label: 'Business name' },
]

export const emptyTemplate = {
  name: '',
  type: 'quick_sms',
  category: '',
  description: '',
  intro: '',
  body: '',
  occasionType: 'birthday',
  status: 'active',
  ctaKind: 'none',
  ctaLabel: '',
  ctaUrl: '',
  ctaValue: '',
  questions: [],
}

export function emptyQuestion(type = 'rating') {
  return {
    id: crypto.randomUUID(),
    prompt: '',
    type,
    required: true,
    options: [''],
  }
}

function filledOptions(question) {
  return (Array.isArray(question?.options) ? question.options : [])
    .map((item) => String(item).trim())
    .filter(Boolean)
}

export const templateSteps = [
  { id: 'type', label: 'Type' },
  { id: 'details', label: 'Details' },
  { id: 'content', label: 'Content' },
  { id: 'review', label: 'Review' },
]

function validateTypeStep(values) {
  const errors = {}
  if (!values.type) errors.type = 'Choose a template type.'
  return errors
}

function validateDetailsStep(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  if (!values.category.trim()) errors.category = 'Category is required.'
  if (values.type === 'campaign_occasion' && !values.occasionType) {
    errors.occasionType = 'Choose an occasion type.'
  }
  return errors
}

function validateContentStep(values) {
  const errors = {}
  if (!values.body.trim()) errors.body = 'Message body is required.'

  if (values.type === 'campaign_promotion' || values.type === 'campaign_occasion') {
    if (values.ctaKind === 'link') {
      if (!values.ctaLabel.trim()) errors.ctaLabel = 'CTA label is required.'
      if (!values.ctaUrl.trim()) errors.ctaUrl = 'CTA URL is required.'
    }
    if (values.ctaKind === 'ussd' || values.ctaKind === 'phone') {
      if (!values.ctaLabel.trim()) errors.ctaLabel = 'CTA label is required.'
      if (!values.ctaValue.trim()) {
        errors.ctaValue = values.ctaKind === 'ussd' ? 'USSD code is required.' : 'Phone number is required.'
      }
    }
  }

  if (values.type === 'survey') {
    if (!values.questions.length) errors.questions = 'Add at least one survey question.'
    values.questions.forEach((question, index) => {
      if (!question.prompt.trim()) errors[`question-${index}-prompt`] = 'Write the question.'
      const meta = questionTypes.find((item) => item.id === question.type)
      if (meta?.needsOptions && filledOptions(question).length < 2) {
        errors[`question-${index}-options`] = 'Add at least two options.'
      }
    })
  }

  return errors
}

export function validateTemplateStep(stepId, values) {
  if (stepId === 'type') return validateTypeStep(values)
  if (stepId === 'details') return validateDetailsStep(values)
  if (stepId === 'content') return validateContentStep(values)
  return {}
}

export function validateTemplate(values) {
  return {
    ...validateTypeStep(values),
    ...validateDetailsStep(values),
    ...validateContentStep(values),
  }
}

function ctaPayload(values) {
  if (values.ctaKind === 'none') return null
  if (values.ctaKind === 'link') {
    return {
      enabled: true,
      type: 'link',
      label: values.ctaLabel.trim(),
      url: values.ctaUrl.trim(),
    }
  }
  return {
    enabled: true,
    type: values.ctaKind,
    label: values.ctaLabel.trim(),
    value: values.ctaValue.trim(),
  }
}

function questionsPayload(questions) {
  return questions.map((question, index) => {
    const meta = questionTypes.find((item) => item.id === question.type)
    const row = {
      prompt: question.prompt.trim(),
      type: question.type,
      required: Boolean(question.required),
      position: index + 1,
    }
    if (meta?.needsOptions) row.options = filledOptions(question)
    return row
  })
}

export function templateCreateBody(values) {
  const body = {
    name: values.name.trim(),
    type: values.type,
    category: values.category.trim(),
    description: values.description.trim() || undefined,
    body: values.body.trim(),
    status: values.status || 'active',
  }

  if (values.type === 'campaign_occasion') {
    body.occasion_type = values.occasionType
    body.cta = ctaPayload(values)
  }

  if (values.type === 'campaign_promotion') {
    body.cta = ctaPayload(values)
  }

  if (values.type === 'survey') {
    body.intro = values.intro.trim() || undefined
    body.questions = questionsPayload(values.questions)
  }

  return body
}

/** Hydrate the create/edit form from a mapped API template. */
export function templateToForm(template) {
  if (!template) return { ...emptyTemplate }
  const cta = template.cta
  const ctaKind = cta?.type === 'link' || cta?.type === 'ussd' || cta?.type === 'phone' ? cta.type : 'none'

  return {
    ...emptyTemplate,
    name: template.name ?? '',
    type: template.type || 'quick_sms',
    category: template.category ?? '',
    description: template.description ?? '',
    intro: template.intro ?? '',
    body: template.body ?? '',
    occasionType: template.occasionType || 'birthday',
    status: template.status || 'active',
    ctaKind,
    ctaLabel: cta?.label ?? '',
    ctaUrl: cta?.url || cta?.value || '',
    ctaValue: cta?.value || cta?.url || '',
    questions: (Array.isArray(template.questions) ? template.questions : []).map((question) => ({
      id: crypto.randomUUID(),
      prompt: question.prompt ?? '',
      type: question.type || 'rating',
      required: question.required !== false,
      options: Array.isArray(question.options) && question.options.length ? question.options.map((item) => String(item)) : [''],
    })),
  }
}
