import { useState } from 'react'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useNotify } from '../../../../features/notifications/useNotify'
import {
  useReblastSmsMutation,
  useResendSmsMutation,
} from '../../../../services/api/messages/messagesApi'
import {
  canReblastMessage,
  canResendMessage,
  defaultReblastMessage,
  defaultResendMessage,
  messageFailedCount,
  messageRecipientCount,
} from '../model'
import { MessageActionDialog } from './MessageActionDialog'

export function useMessageActions({ onDone } = {}) {
  const notify = useNotify()
  const [reblastSms, reblastState] = useReblastSmsMutation()
  const [resendSms, resendState] = useResendSmsMutation()
  const [pending, setPending] = useState(null)
  const [draft, setDraft] = useState('')
  const busy = reblastState.isLoading || resendState.isLoading

  function ask(type, message) {
    if (busy || !message?.id) return
    if (type === 'reblast' && !canReblastMessage(message)) return
    if (type === 'resend' && !canResendMessage(message)) return

    setPending({ type, message })
    setDraft(type === 'reblast' ? defaultReblastMessage(message) : defaultResendMessage(message))
  }

  function close() {
    if (busy) return
    setPending(null)
    setDraft('')
  }

  async function confirm() {
    if (!pending || busy) return
    const messageText = draft.trim()
    if (!messageText) {
      notify.error('Enter a message to send.')
      return
    }

    const { type, message } = pending

    try {
      const result =
        type === 'reblast'
          ? await reblastSms({ smsId: message.id, message: messageText }).unwrap()
          : await resendSms({ smsId: message.id, message: messageText }).unwrap()

      notify.success(result.message || (type === 'reblast' ? 'Reblast queued.' : 'Message queued for sending.'))
      setPending(null)
      setDraft('')
      onDone?.(result)
    } catch (error) {
      notify.error(apiErrorMessage(error) || (type === 'reblast' ? 'Reblast failed.' : 'Resend failed.'))
    }
  }

  const recipientCount = pending
    ? pending.type === 'reblast'
      ? messageFailedCount(pending.message)
      : messageRecipientCount(pending.message)
    : 0

  const dialog = pending ? (
    <MessageActionDialog
      type={pending.type}
      recipientCount={recipientCount}
      draft={draft}
      onDraftChange={setDraft}
      busy={busy}
      onConfirm={confirm}
      onClose={close}
    />
  ) : null

  return {
    ask,
    dialog,
    busy,
    canReblast: canReblastMessage,
    canResend: canResendMessage,
  }
}
