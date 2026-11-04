import { useState } from 'react'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useDeleteContactImportMutation } from '../../../../services/api/contacts/contactRecordsApi'

export function useUploadActions({ groupId, onDone } = {}) {
  const [removeUpload, removeState] = useDeleteContactImportMutation()
  const [pending, setPending] = useState(null)
  const [actionError, setActionError] = useState('')
  const busy = removeState.isLoading

  function askDelete(upload) {
    if (busy || !upload) return
    setActionError('')
    setPending(upload)
  }

  function close() {
    if (busy) return
    setPending(null)
    setActionError('')
  }

  async function confirm() {
    if (!pending || busy) return
    setActionError('')

    try {
      const message = await removeUpload({ groupId, importId: pending.id }).unwrap()
      setPending(null)
      onDone?.(message, pending)
    } catch (error) {
      setActionError(apiErrorMessage(error))
    }
  }

  const dialog = pending ? (
    <ConfirmDialog
      title={`Delete ${pending.fileName}?`}
      description="This removes the upload record from this group. Contacts already added from the file stay in the group unless you remove them separately."
      confirmLabel="Delete upload"
      busyLabel="Deleting upload"
      tone="danger"
      busy={busy}
      error={actionError}
      onConfirm={confirm}
      onClose={close}
    />
  ) : null

  return { askDelete, dialog, busy }
}
