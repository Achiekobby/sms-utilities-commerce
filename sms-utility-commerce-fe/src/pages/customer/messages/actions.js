import { Ban, CalendarClock, Eye, RefreshCw, RotateCcw, Send } from 'lucide-react'
import { paths } from '../../../routes/paths'
import { formatCount } from '../dashboard/format'
import {
  canCancelMessage,
  canReblastMessage,
  canResendMessage,
  messageFailedCount,
} from './model'

/**
 * Dropdown items for message actions. Resend/reblast variants are listed
 * explicitly so the dialog opens already configured.
 */
export function messageMenuItems(
  message,
  { includeView = false, busy = false, onAction, onView } = {},
) {
  if (!message?.id) return []

  const items = []
  const bulk = message.kind === 'groups'
  const failed = messageFailedCount(message)
  const canResend = canResendMessage(message)
  const canReblast = canReblastMessage(message)
  const canCancel = canCancelMessage(message)

  if (includeView) {
    items.push({
      id: 'view',
      label: 'View details',
      hint: onView ? 'Preview this send' : 'Open full report',
      icon: Eye,
      color: '#0B63F6',
      tint: '#E3EFFD',
      ...(onView
        ? {
            disabled: busy,
            onClick: () => onView(message),
          }
        : { to: paths.message(message.id) }),
    })
  }

  if (canResend) {
    if (items.length) items.push('separator')
    items.push(
      {
        id: 'resend-now',
        label: 'Resend now',
        hint: 'Queue to the same numbers',
        icon: Send,
        color: '#0B63F6',
        tint: '#E3EFFD',
        disabled: busy,
        onClick: () => onAction?.('resend', message, { when: 'now' }),
      },
      {
        id: 'resend-later',
        label: 'Schedule resend',
        hint: 'Pick a date and time',
        icon: CalendarClock,
        color: '#B45F06',
        tint: '#FFF6E8',
        tone: 'caution',
        disabled: busy,
        onClick: () => onAction?.('resend', message, { when: 'later' }),
      },
    )
  }

  if (canReblast) {
    if (items.length) items.push('separator')

    if (bulk) {
      items.push(
        {
          id: 'reblast-all-now',
          label: 'Reblast all now',
          hint: 'Everyone in the original group(s)',
          icon: RotateCcw,
          color: '#008859',
          tint: '#DDF3E6',
          disabled: busy,
          onClick: () => onAction?.('reblast', message, { target: 'all', when: 'now' }),
        },
        {
          id: 'reblast-all-later',
          label: 'Schedule reblast',
          hint: 'All contacts, later',
          icon: CalendarClock,
          color: '#B45F06',
          tint: '#FFF6E8',
          tone: 'caution',
          disabled: busy,
          onClick: () => onAction?.('reblast', message, { target: 'all', when: 'later' }),
        },
        {
          id: 'reblast-failed',
          label: 'Reblast failed',
          hint:
            failed > 0
              ? `${formatCount(failed)} failed recipient${failed === 1 ? '' : 's'}`
              : 'No failed recipients',
          icon: RefreshCw,
          color: '#C21F2D',
          tint: '#FDECEE',
          tone: 'danger',
          disabled: busy || failed < 1,
          onClick: () => onAction?.('reblast', message, { target: 'failed', when: 'now' }),
        },
      )
    } else {
      items.push({
        id: 'reblast-now',
        label: 'Reblast now',
        hint: 'Same numbers, new message',
        icon: RotateCcw,
        color: '#008859',
        tint: '#DDF3E6',
        disabled: busy,
        onClick: () => onAction?.('reblast', message, { when: 'now' }),
      })
    }
  }

  if (canCancel) {
    if (items.length) items.push('separator')
    items.push({
      id: 'cancel',
      label: 'Cancel send',
      hint: 'Refund scheduled units',
      icon: Ban,
      color: '#C21F2D',
      tint: '#FDECEE',
      tone: 'danger',
      disabled: busy,
      onClick: () => onAction?.('cancel', message),
    })
  }

  return items
}

export function messageHasActions(message) {
  return (
    canCancelMessage(message) || canResendMessage(message) || canReblastMessage(message)
  )
}
