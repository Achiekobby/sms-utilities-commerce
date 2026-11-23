import { createTypes } from '../../../features/templates/templateForm'
import { templateTypeLabel } from '../../../features/templates/templateModel'

export const emptyTemplateFilters = {
  type: '',
  status: '',
  category: '',
  scope: '',
  owner: '',
  occasionType: '',
}

export const templateFilterTypeOptions = createTypes.map((item) => ({
  id: item.id,
  label: item.label,
}))

export function activeTemplateFilterCount(filters) {
  return (
    (filters.type ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.scope ? 1 : 0) +
    (filters.owner ? 1 : 0) +
    (filters.occasionType ? 1 : 0)
  )
}

export function templateFilterChips(filters) {
  const chips = []
  if (filters.type) {
    chips.push({
      key: `type-${filters.type}`,
      group: 'type',
      id: filters.type,
      label: templateTypeLabel(filters.type),
    })
  }
  if (filters.status) {
    chips.push({
      key: `status-${filters.status}`,
      group: 'status',
      id: filters.status,
      label: filters.status === 'active' ? 'Active' : filters.status === 'inactive' ? 'Inactive' : 'Draft',
    })
  }
  if (filters.category) {
    chips.push({
      key: `category-${filters.category}`,
      group: 'category',
      id: filters.category,
      label: filters.category,
    })
  }
  if (filters.scope) {
    chips.push({
      key: `scope-${filters.scope}`,
      group: 'scope',
      id: filters.scope,
      label: filters.scope === 'global' ? 'Global' : filters.scope === 'tenant' ? 'Workspace' : filters.scope,
    })
  }
  if (filters.owner) {
    chips.push({
      key: `owner-${filters.owner}`,
      group: 'owner',
      id: filters.owner,
      label: filters.owner === 'mine' ? 'My templates' : filters.owner,
    })
  }
  if (filters.occasionType) {
    chips.push({
      key: `occasion-${filters.occasionType}`,
      group: 'occasionType',
      id: filters.occasionType,
      label: templateTypeLabel(filters.occasionType),
    })
  }
  return chips
}

export function templatesQueryParams(filters = emptyTemplateFilters, { page = 1, perPage = 15, search = '' } = {}) {
  return {
    page,
    perPage,
    search,
    type: filters.type || '',
    status: filters.status || '',
    category: filters.category || '',
    scope: filters.scope || '',
    owner: filters.owner || '',
    occasionType: filters.occasionType || '',
    includeInactive: filters.status === 'inactive' || filters.status === 'draft',
  }
}
