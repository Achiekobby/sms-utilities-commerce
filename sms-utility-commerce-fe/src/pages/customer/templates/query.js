import { typeLabel } from '../campaigns/model'

export const emptyTemplateFilters = {
  types: [],
  senders: [],
}

export function activeTemplateFilterCount(filters) {
  return filters.types.length + filters.senders.length
}

export function templateSenders(templates) {
  return [...new Set(templates.map((template) => template.sender))]
}

function includes(list, value) {
  return list.length === 0 || list.includes(value)
}

export function queryTemplates(templates, { search = '', types = [], senders = [] } = {}) {
  const term = search.trim().toLowerCase()

  return templates.filter((template) => {
    if (!includes(types, template.type)) return false
    if (!includes(senders, template.sender)) return false
    if (!term) return true

    const haystack = [template.name, template.description, template.body, template.sender, typeLabel(template.type)]
      .join(' ')
      .toLowerCase()

    return haystack.includes(term)
  })
}
