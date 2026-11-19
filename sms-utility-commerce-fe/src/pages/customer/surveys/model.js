let sequence = 0;

export const questionTypes = [
  { id: "rating", label: "Rating", hint: "Score from 1 to 5" },
  { id: "single_choice", label: "Single choice", hint: "Pick one option" },
  {
    id: "multiple_choice",
    label: "Multiple choice",
    hint: "Pick any that apply",
  },
  { id: "text", label: "Short answer", hint: "One line of text" },
  { id: "long_text", label: "Paragraph", hint: "A longer reply" },
  { id: "yes_no", label: "Yes or no", hint: "A simple decision" },
  { id: "number", label: "Number", hint: "A figure" },
];

const choiceTypes = new Set(["single_choice", "multiple_choice"]);

export function isChoiceType(type) {
  return choiceTypes.has(type);
}

export function questionTypeMeta(type) {
  return questionTypes.find((item) => item.id === type) ?? questionTypes[0];
}

export function newQuestion(type = "rating") {
  sequence += 1;
  return {
    id: `q-${Date.now()}-${sequence}`,
    serverId: null,
    type,
    prompt: "",
    required: true,
    options: isChoiceType(type) ? ["", ""] : [],
  };
}

export const surveyLimits = {
  name: 120,
  intro: 2000,
  body: 1600,
  prompt: 500,
  questions: 50,
  options: 20,
  groups: 20,
  senderMin: 3,
  senderMax: 11,
};

export const emptySurvey = {
  name: "",
  intro: "",
  body: "",
  when: "none",
  sendAt: "",
  groupIds: [],
  sender: "",
  questions: [],
};

export function withQuestionType(question, type) {
  if (!isChoiceType(type)) return { ...question, type };
  const options = [...question.options];
  while (options.length < 2) options.push("");
  return { ...question, type, options };
}

function filledOptions(question) {
  return question.options.map((option) => option.trim()).filter(Boolean);
}

function nullableText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

export function surveySendAt(values) {
  if (values.when !== "later") return null;
  const match = String(values.sendAt ?? "")
    .trim()
    .match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  return match ? `${match[1]} ${match[2]}:00` : null;
}

function dateTimeInput(value) {
  const match = String(value ?? "")
    .trim()
    .match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  return match ? `${match[1]}T${match[2]}` : "";
}

export function formValuesFromSurvey(survey) {
  const sendAt = dateTimeInput(survey?.sendAt);
  return {
    name: survey?.name ?? "",
    intro: survey?.intro || survey?.description || "",
    body: survey?.body ?? "",
    when: sendAt ? "later" : "none",
    sendAt,
    groupIds: (survey?.groupIds ?? []).map((id) => String(id)),
    sender: survey?.sender ?? "",
    questions: (survey?.questions ?? []).map((question) => ({
      ...question,
      options: [...(question.options ?? [])],
    })),
  };
}

export function questionPayload(question, position = 0) {
  const item = {
    prompt: question.prompt.trim(),
    type: question.type,
    required: Boolean(question.required),
    position,
  };
  if (isChoiceType(question.type)) item.options = filledOptions(question);
  const serverId = Number(question.serverId);
  if (Number.isInteger(serverId) && serverId > 0) item.id = serverId;
  return item;
}

export function questionsPayload(questions) {
  return {
    questions: questions.map((question, index) =>
      questionPayload(question, index),
    ),
  };
}

export function surveyPayload(values) {
  return {
    name: values.name.trim(),
    intro: nullableText(values.intro),
    body: nullableText(values.body),
    contact_group_ids: values.groupIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id)),
    sender: values.sender,
    send_at: surveySendAt(values),
    questions: values.questions.map((question, index) =>
      questionPayload(question, index),
    ),
  };
}

function questionErrors(question) {
  const errors = {};
  const prompt = question.prompt.trim();
  if (!prompt) errors.prompt = "Write the question.";
  else if (prompt.length > surveyLimits.prompt)
    errors.prompt = `Keep the question to ${surveyLimits.prompt} characters.`;
  else if (!questionTypes.some((item) => item.id === question.type))
    errors.prompt = "Choose a question type.";
  if (isChoiceType(question.type)) {
    const count = filledOptions(question).length;
    if (count < 2) errors.options = "Add at least two options.";
    else if (count > surveyLimits.options)
      errors.options = `Use at most ${surveyLimits.options} options.`;
  }
  return errors;
}

export function validateQuestions(questions) {
  const errors = {};
  if (!questions.length) errors.questions = "Add at least one question.";
  else if (questions.length > surveyLimits.questions)
    errors.questions = `Use at most ${surveyLimits.questions} questions.`;
  const byId = {};
  questions.forEach((question) => {
    const found = questionErrors(question);
    if (Object.keys(found).length) byId[question.id] = found;
  });
  if (Object.keys(byId).length) errors.questionsById = byId;
  return errors;
}

export function validateSurvey(values, { senders = [] } = {}) {
  const errors = {
    ...validateQuestions(values.questions),
  };
  const name = values.name.trim();
  const intro = values.intro.trim();
  const body = values.body.trim();
  if (!name) errors.name = "Name the survey.";
  else if (name.length > surveyLimits.name)
    errors.name = `Keep the name to ${surveyLimits.name} characters.`;
  if (intro.length > surveyLimits.intro)
    errors.intro = `Keep the introduction to ${surveyLimits.intro} characters.`;
  if (body.length > surveyLimits.body)
    errors.body = `Keep the message to ${surveyLimits.body} characters.`;
  if (!values.groupIds.length)
    errors.groupIds = "Choose at least one contact group.";
  else if (values.groupIds.length > surveyLimits.groups)
    errors.groupIds = `Choose at most ${surveyLimits.groups} contact groups.`;
  const sender = String(values.sender ?? "");
  if (!senders.includes(sender)) errors.sender = "Choose a sender.";
  else if (
    sender.length < surveyLimits.senderMin ||
    sender.length > surveyLimits.senderMax
  ) {
    errors.sender = `Sender must be ${surveyLimits.senderMin}–${surveyLimits.senderMax} characters.`;
  }
  if (values.when === "later" && !surveySendAt(values))
    errors.sendAt = "Choose a date and time.";
  return errors;
}

export function answerReady(question, answer) {
  if (!question.required) return true;
  if (question.type === "rating")
    return Number(answer) >= 1 && Number(answer) <= 5;
  if (question.type === "multiple_choice")
    return Array.isArray(answer) && answer.length > 0;
  if (question.type === "yes_no") return answer === "yes" || answer === "no";
  if (question.type === "number")
    return (
      String(answer ?? "").trim() !== "" && Number.isFinite(Number(answer))
    );
  return String(answer ?? "").trim() !== "";
}
