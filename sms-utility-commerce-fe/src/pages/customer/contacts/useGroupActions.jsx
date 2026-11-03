import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { apiErrorMessage } from '../../../features/auth/client'
import { groupRemoved } from '../../../features/contacts/contactsSlice'
import {
  useArchiveContactGroupMutation,
  useForceDeleteContactGroupMutation,
  useRestoreContactGroupMutation,
} from '../../../services/api/contacts/contactsApi'

const steps = {
  archive: {
    tone: 'caution',
    title: (name) => `Archive ${name}?`,
    description: (name) =>
      `${name} leaves your active groups. The contacts in it stay put and are not removed. You can restore the group from Archived.`,
    confirmLabel: 'Archive group',
    busyLabel: 'Archiving group',
  },
  restore: {
    tone: 'restore',
    focusConfirm: true,
    title: (name) => `Restore ${name}?`,
    description: (name) => `${name} goes back to your active groups, with the same contacts.`,
    confirmLabel: 'Restore group',
    busyLabel: 'Restoring group',
  },
  discard: {
    tone: 'danger',
    title: (name) => `Permanently remove ${name}?`,
    description: (name) => `This cannot be undone. ${name} will be discarded and cannot be restored.`,
    confirmLabel: 'Remove forever',
    busyLabel: 'Removing group',
  },
}

export function useGroupActions({ onSuccess } = {}) {
  const dispatch = useDispatch()
  const [archiveGroup, archiveState] = useArchiveContactGroupMutation()
  const [restoreGroup, restoreState] = useRestoreContactGroupMutation()
  const [discardGroup, discardState] = useForceDeleteContactGroupMutation()
  const [pending, setPending] = useState(null)
  const [actionError, setActionError] = useState('')

  const busy = archiveState.isLoading || restoreState.isLoading || discardState.isLoading
  const step = pending ? steps[pending.type] : null

  function ask(type, group) {
    if (busy) return
    setActionError('')
    setPending({ type, group })
  }

  function close() {
    if (busy) return
    setPending(null)
    setActionError('')
  }

  async function confirm() {
    if (!pending || busy) return
    setActionError('')
    const run = { archive: archiveGroup, restore: restoreGroup, discard: discardGroup }[pending.type]

    try {
      const result = await run(pending.group.id).unwrap()
      if (pending.type !== 'restore') dispatch(groupRemoved(pending.group.id))
      const message = result?.message
      setPending(null)
      onSuccess?.(pending.type, message, pending.group)
    } catch (error) {
      setActionError(apiErrorMessage(error))
    }
  }

  const dialog = step ? (
    <ConfirmDialog
      title={step.title(pending.group.name)}
      description={step.description(pending.group.name)}
      confirmLabel={step.confirmLabel}
      busyLabel={step.busyLabel}
      tone={step.tone}
      focusConfirm={step.focusConfirm}
      busy={busy}
      error={actionError}
      onConfirm={confirm}
      onClose={close}
    />
  ) : null

  return { ask, dialog }
}
