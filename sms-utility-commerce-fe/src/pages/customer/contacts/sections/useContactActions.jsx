import { useState } from 'react'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { apiErrorMessage } from '../../../../features/auth/client'
import { contactName } from '../../../../features/contacts/contact'
import { useDeleteContactMutation, useUpdateContactDndMutation } from '../../../../services/api/contacts/contactRecordsApi'

export function useContactActions({ groupId, onDone }) {
  const [removeContact, removeState] = useDeleteContactMutation()
  const [updateDnd, dndState] = useUpdateContactDndMutation()
  const [pending, setPending] = useState(null)
  const [actionError, setActionError] = useState('')
  const busy = removeState.isLoading || dndState.isLoading

  function ask(type, contact) {
    if (busy) return
    setActionError('')
    setPending({ type, contact })
  }

  function close() {
    if (busy) return
    setPending(null)
    setActionError('')
  }

  async function confirm() {
    if (!pending || busy) return
    setActionError('')
    const { contact, type } = pending

    try {
      if (type === 'remove') {
        const message = await removeContact({ groupId, contactId: contact.id }).unwrap()
        setPending(null)
        onDone?.(message)
      } else {
        const result = await updateDnd({ groupId, contactId: contact.id, active: !contact.dnd }).unwrap()
        setPending(null)
        onDone?.(result.message)
      }
    } catch (error) {
      setActionError(apiErrorMessage(error))
    }
  }

  const name = pending ? contactName(pending.contact) : ''
  const turningOn = pending?.type === 'dnd' && !pending.contact.dnd
  const dialog = pending ? (
    <ConfirmDialog
      title={pending.type === 'remove' ? `Remove ${name}?` : turningOn ? `Stop messages to ${name}?` : `Allow messages to ${name}?`}
      description={
        pending.type === 'remove'
          ? `${name} will be removed from this group only. This cannot be undone from here.`
          : turningOn
            ? `${name} will be on the do-not-disturb list and will not receive messages.`
            : `${name} will be taken off the do-not-disturb list and can receive messages again.`
      }
      confirmLabel={pending.type === 'remove' ? 'Remove contact' : turningOn ? 'Turn on do not disturb' : 'Allow messages'}
      busyLabel={pending.type === 'remove' ? 'Removing contact' : 'Updating'}
      tone={pending.type === 'remove' || turningOn ? 'danger' : 'restore'}
      focusConfirm={pending.type === 'dnd' && pending.contact.dnd}
      busy={busy}
      error={actionError}
      onConfirm={confirm}
      onClose={close}
    />
  ) : null

  return { ask, dialog, busy }
}
