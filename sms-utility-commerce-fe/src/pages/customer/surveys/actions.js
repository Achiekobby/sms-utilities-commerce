import { Archive, Ban, CircleCheck, Eye, Pause, Pencil, Play, RotateCcw, Trash2 } from 'lucide-react'
import { paths } from '../../../routes/paths'

export const surveyLifecycleActions = {
  activate: {
    label: 'Activate',
    hint: 'Start this survey',
    icon: Play,
    color: '#008859',
    tint: '#DDF3E6',
    wash: 'linear-gradient(180deg, #EEF9F2 0%, #FFFFFF 72%)',
    title: 'Activate this survey?',
    description: 'Eligible contacts will receive the invitation when sending begins.',
    resultLabel: 'Scheduled / Active',
    confirmLabel: 'Activate survey',
    busyLabel: 'Activating…',
    buttonClass: 'bg-green hover:bg-[#006B46]',
  },
  pause: {
    label: 'Pause',
    hint: 'Hold this survey',
    icon: Pause,
    color: '#B45F06',
    tint: '#FFF6E8',
    wash: 'linear-gradient(180deg, #FFF8EE 0%, #FFFFFF 72%)',
    tone: 'caution',
    title: 'Pause this survey?',
    description: 'New invitations stop and the survey holds until you resume it.',
    resultLabel: 'Paused',
    confirmLabel: 'Pause survey',
    busyLabel: 'Pausing…',
    buttonClass: 'bg-[#B45F06] hover:bg-[#945008]',
  },
  resume: {
    label: 'Resume',
    hint: 'Continue this survey',
    icon: Play,
    color: '#008859',
    tint: '#DDF3E6',
    wash: 'linear-gradient(180deg, #EEF9F2 0%, #FFFFFF 72%)',
    title: 'Resume this survey?',
    description: 'The survey becomes active again and can continue collecting responses.',
    resultLabel: 'Active',
    confirmLabel: 'Resume survey',
    busyLabel: 'Resuming…',
    buttonClass: 'bg-green hover:bg-[#006B46]',
  },
  complete: {
    label: 'Complete',
    hint: 'Mark as finished',
    icon: CircleCheck,
    color: '#0B63F6',
    tint: '#E3EFFD',
    wash: 'linear-gradient(180deg, #EEF4FC 0%, #FFFFFF 72%)',
    tone: 'caution',
    title: 'Complete this survey?',
    description: 'The survey is marked finished and stops accepting new responses.',
    resultLabel: 'Completed',
    confirmLabel: 'Complete survey',
    busyLabel: 'Completing…',
    buttonClass: 'bg-navy hover:bg-navy/90',
  },
  cancel: {
    label: 'Cancel',
    hint: 'Stop this survey',
    icon: Ban,
    color: '#C21F2D',
    tint: '#FDECEE',
    wash: 'linear-gradient(180deg, #FDF1F2 0%, #FFFFFF 72%)',
    tone: 'danger',
    title: 'Cancel this survey?',
    description: 'It will not send any further invitations and cannot be reactivated.',
    resultLabel: 'Cancelled',
    confirmLabel: 'Cancel survey',
    busyLabel: 'Cancelling…',
    buttonClass: 'bg-[#C21F2D] hover:bg-[#9F1C26]',
  },
}

export const surveyUtilityActions = {
  archive: {
    label: 'Archive',
    icon: Archive,
    color: '#B45F06',
    tint: '#FFEBCB',
    wash: 'linear-gradient(180deg, #FFF6E8 0%, #FFFFFF 72%)',
    tone: 'caution',
    title: 'Archive this survey?',
    description: 'It moves to Archived. You can restore it later from that list.',
    resultLabel: 'Archived',
    confirmLabel: 'Archive survey',
    busyLabel: 'Archiving…',
    buttonClass: 'bg-[#B45F06] hover:bg-[#945008]',
  },
  restore: {
    label: 'Restore',
    icon: RotateCcw,
    color: '#0E7A38',
    tint: '#DDF3E6',
    wash: 'linear-gradient(180deg, #EEF9F2 0%, #FFFFFF 72%)',
    title: 'Restore this survey?',
    description: 'It returns to your active surveys with its previous details intact.',
    resultLabel: 'Active',
    confirmLabel: 'Restore survey',
    busyLabel: 'Restoring…',
    buttonClass: 'bg-green hover:bg-[#006B46]',
  },
  discard: {
    label: 'Remove forever',
    icon: Trash2,
    color: '#C21F2D',
    tint: '#FDECEE',
    wash: 'linear-gradient(180deg, #FDF1F2 0%, #FFFFFF 72%)',
    tone: 'danger',
    title: 'Remove this survey forever?',
    description: 'The survey and its response records will be permanently deleted.',
    resultLabel: 'Deleted',
    confirmLabel: 'Remove forever',
    busyLabel: 'Removing…',
    buttonClass: 'bg-[#C21F2D] hover:bg-[#9F1C26]',
  },
}

export function surveyDialogMeta(action) {
  return surveyLifecycleActions[action] ?? surveyUtilityActions[action] ?? null
}

const byStatus = {
  draft: ['activate', 'cancel'],
  scheduled: ['pause', 'complete', 'cancel'],
  active: ['pause', 'complete', 'cancel'],
  paused: ['resume', 'complete', 'cancel'],
  failed: ['activate', 'cancel'],
}

export function surveyLifecycleForStatus(status) {
  return byStatus[String(status ?? '').toLowerCase()] ?? []
}

const editableStatuses = new Set(['draft', 'failed'])

export function canEditSurvey(status) {
  return editableStatuses.has(String(status ?? '').toLowerCase())
}

export function surveyMenuItems(survey, { archived = false, busy = false, onAction } = {}) {
  if (archived) {
    return [
      {
        id: 'restore',
        label: 'Restore survey',
        hint: 'Move back to active surveys',
        icon: RotateCcw,
        color: '#0E7A38',
        tint: '#DDF3E6',
        disabled: busy,
        onClick: () => onAction?.('restore'),
      },
      'separator',
      {
        id: 'discard',
        label: 'Remove forever',
        hint: 'This cannot be undone',
        icon: Trash2,
        color: '#C21F2D',
        tint: '#FDECEE',
        tone: 'danger',
        disabled: busy,
        onClick: () => onAction?.('discard'),
      },
    ]
  }

  const items = [
    {
      id: 'view',
      label: 'View survey',
      hint: 'Open this survey',
      icon: Eye,
      color: '#0B63F6',
      tint: '#E3EFFD',
      to: paths.survey(survey.id),
    },
  ]

  if (canEditSurvey(survey.status)) {
    items.push({
      id: 'edit',
      label: 'Edit',
      hint: 'Change details and questions',
      icon: Pencil,
      color: '#0B1F5B',
      tint: '#F3F6FB',
      to: paths.editSurvey(survey.id),
    })
  }

  const actions = surveyLifecycleForStatus(survey.status)
  if (actions.length) items.push('separator')

  actions.forEach((id, index) => {
    const meta = surveyLifecycleActions[id]
    if (id === 'cancel' && index > 0) items.push('separator')
    items.push({
      id,
      label: meta.label,
      hint: meta.hint,
      icon: meta.icon,
      color: meta.color,
      tint: meta.tint,
      tone: meta.tone,
      disabled: busy,
      onClick: () => onAction?.(id),
    })
  })

  items.push('separator', {
    id: 'archive',
    label: 'Archive',
    hint: 'Move to archived surveys',
    icon: Archive,
    color: '#B45F06',
    tint: '#FFEBCB',
    tone: 'caution',
    disabled: busy,
    onClick: () => onAction?.('archive'),
  })

  return items
}
