import { Ban, CircleCheck, Eye, Pause, Play } from 'lucide-react'
import { paths } from '../../../routes/paths'

export const lifecycleActions = {
  activate: {
    label: 'Activate',
    hint: 'Start this campaign',
    icon: Play,
    color: '#008859',
    tint: '#DDF3E6',
    confirmTitle: 'Activate this campaign?',
    confirmDescription: 'Eligible contacts will start receiving it.',
    confirmLabel: 'Activate campaign',
    busyLabel: 'Activating…',
    buttonClass: 'bg-green hover:bg-[#006B46]',
  },
  pause: {
    label: 'Pause',
    hint: 'Hold sending',
    icon: Pause,
    color: '#B45F06',
    tint: '#FFF6E8',
    tone: 'caution',
    confirmTitle: 'Pause this campaign?',
    confirmDescription: 'Sending stops until you resume it.',
    confirmLabel: 'Pause campaign',
    busyLabel: 'Pausing…',
    buttonClass: 'bg-[#B45F06] hover:bg-[#945008]',
  },
  resume: {
    label: 'Resume',
    hint: 'Continue sending',
    icon: Play,
    color: '#008859',
    tint: '#DDF3E6',
    confirmTitle: 'Resume this campaign?',
    confirmDescription: 'Sending continues for contacts who have not received it yet.',
    confirmLabel: 'Resume campaign',
    busyLabel: 'Resuming…',
    buttonClass: 'bg-green hover:bg-[#006B46]',
  },
  complete: {
    label: 'Complete',
    hint: 'Mark as finished',
    icon: CircleCheck,
    color: '#0B63F6',
    tint: '#E3EFFD',
    tone: 'caution',
    confirmTitle: 'Complete this campaign?',
    confirmDescription: 'Sending stops and the campaign is marked finished.',
    confirmLabel: 'Complete campaign',
    busyLabel: 'Completing…',
    buttonClass: 'bg-navy hover:bg-navy/90',
  },
  cancel: {
    label: 'Cancel',
    hint: 'Stop this campaign',
    icon: Ban,
    color: '#C21F2D',
    tint: '#FDECEE',
    tone: 'danger',
    confirmTitle: 'Cancel this campaign?',
    confirmDescription: 'It will not send any further messages.',
    confirmLabel: 'Cancel campaign',
    busyLabel: 'Cancelling…',
    buttonClass: 'bg-[#C21F2D] hover:bg-[#9F1C26]',
  },
}

const byStatus = {
  draft: ['activate', 'cancel'],
  scheduled: ['pause', 'complete', 'cancel'],
  active: ['pause', 'complete', 'cancel'],
  sending: ['pause', 'complete', 'cancel'],
  queued: ['pause', 'cancel'],
  paused: ['resume', 'complete', 'cancel'],
  failed: ['activate', 'cancel'],
}

export function lifecycleForStatus(status) {
  const key = status === 'in_progress' ? 'sending' : status
  return byStatus[key] ?? []
}

export function campaignMenuItems(campaign, { includeView = false, onAction, busy = false } = {}) {
  const items = []
  if (includeView) {
    items.push({
      id: 'view',
      label: 'View campaign',
      hint: 'Open details',
      icon: Eye,
      color: '#0B63F6',
      tint: '#E3EFFD',
      to: paths.campaign(campaign.id),
    })
  }

  const actions = lifecycleForStatus(campaign.status)
  if (includeView && actions.length) items.push('separator')

  actions.forEach((id, index) => {
    const meta = lifecycleActions[id]
    if (id === 'cancel' && (index > 0 || includeView)) items.push('separator')
    items.push({
      id,
      label: meta.label,
      hint: meta.hint,
      icon: meta.icon,
      color: meta.color,
      tint: meta.tint,
      tone: meta.tone,
      disabled: busy,
      onClick: () => onAction?.(id, meta),
    })
  })

  return items
}
