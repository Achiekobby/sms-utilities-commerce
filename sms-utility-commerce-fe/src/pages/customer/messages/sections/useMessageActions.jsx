import { useState } from 'react'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useNotify } from '../../../../features/notifications/useNotify'
import {
  useReblastSmsMutation,
  useResendSmsMutation,
} from '../../../../services/api/messages/messagesApi'
import { formatCount } from '../../dashboard/format'
import {
  canReblastMessage,
  canResendMessage,
  defaultReblastMessage,
  defaultResendMessage,
  messageFailedCount,
} from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

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

  const failed = pending ? messageFailedCount(pending.message) : 0
  const dialog = pending ? (
    <ConfirmDialog
      tone="restore"
      title={pending.type === 'reblast' ? 'Reblast failed recipients?' : 'Resend this message?'}
      description={
        <div className="space-y-3">
          <p>
            {pending.type === 'reblast'
              ? `Queue a new send to ${formatCount(failed)} failed recipient${failed === 1 ? '' : 's'}.`
              : 'Queue a new send to the same recipients.'}
          </p>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink/55">Message</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              className={`w-full resize-y rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm leading-6 text-navy outline-none transition-colors hover:border-blue/35 focus:border-blue ${focusClass}`}
            />
          </label>
        </div>
      }
      confirmLabel={pending.type === 'reblast' ? 'Reblast' : 'Resend'}
      busyLabel={pending.type === 'reblast' ? 'Queueing reblast…' : 'Queueing resend…'}
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
