import { useState } from 'react'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useNotify } from '../../../../features/notifications/useNotify'
import {
  useCancelSmsMutation,
  useReblastSmsMutation,
  useResendSmsMutation,
} from '../../../../services/api/messages/messagesApi'
import { useGetSenderIdsQuery } from '../../../../services/api/sender-ids/senderIdsApi'
import { approvedSenderNames } from '../../sender-ids/model'
import {
  canCancelMessage,
  canReblastMessage,
  canResendMessage,
  defaultReblastMessage,
  defaultResendMessage,
  reblastRecipientCount,
  reblastSmsBody,
  resendSmsBody,
} from '../model'
import { MessageActionDialog } from './MessageActionDialog'

function validateSchedule({ when, sendAt, sendTime }, now = new Date()) {
  if (when !== 'later') return {}
  const errors = {}
  const day = String(sendAt ?? '').slice(0, 10)
  const timeMatch = String(sendTime ?? '').match(/^(\d{2}):(\d{2})/)
  const date = /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T00:00:00`) : null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (!date || Number.isNaN(date.getTime())) errors.sendAt = 'Choose a date.'
  else if (date < today) errors.sendAt = 'Choose today or a future date.'

  if (!timeMatch) errors.sendTime = 'Choose a send time.'
  else if (date && !Number.isNaN(date.getTime()) && date.getTime() === today.getTime()) {
    const hours = Number(timeMatch[1])
    const minutes = Number(timeMatch[2])
    const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
    if (scheduled <= now) errors.sendTime = 'Choose a time later than now.'
  }

  return errors
}

function resolveFrom({ senderMode, sender, message }) {
  if (senderMode === 'change') return String(sender ?? '').trim()
  return String(message?.sender ?? '').trim()
}

export function useMessageActions({ onDone } = {}) {
  const notify = useNotify()
  const [reblastSms, reblastState] = useReblastSmsMutation()
  const [resendSms, resendState] = useResendSmsMutation()
  const [cancelSms, cancelState] = useCancelSmsMutation()
  const sendersQuery = useGetSenderIdsQuery({ page: 1, perPage: 100, status: 'approved' })
  const approved = approvedSenderNames(sendersQuery.data?.rows ?? [])
  const [pending, setPending] = useState(null)
  const [draft, setDraft] = useState('')
  const [target, setTarget] = useState('all')
  const [when, setWhen] = useState('now')
  const [sendAt, setSendAt] = useState('')
  const [sendTime, setSendTime] = useState('')
  const [senderMode, setSenderMode] = useState('keep')
  const [sender, setSender] = useState('')
  const [errors, setErrors] = useState({})
  const [actionError, setActionError] = useState('')
  const [locked, setLocked] = useState({ target: false, when: false })
  const busy = reblastState.isLoading || resendState.isLoading || cancelState.isLoading

  function resetForm() {
    setPending(null)
    setDraft('')
    setTarget('all')
    setWhen('now')
    setSendAt('')
    setSendTime('')
    setSenderMode('keep')
    setSender('')
    setErrors({})
    setActionError('')
    setLocked({ target: false, when: false })
  }

  function ask(type, message, options = {}) {
    if (busy || !message?.id) return
    if (type === 'reblast' && !canReblastMessage(message)) return
    if (type === 'resend' && !canResendMessage(message)) return
    if (type === 'cancel' && !canCancelMessage(message)) return

    const nextTarget = options.target === 'failed' ? 'failed' : 'all'
    const nextWhen = options.when === 'later' ? 'later' : 'now'
    const lockTarget = options.target != null
    const lockWhen = options.when != null
    const originalSender = String(message.sender ?? '').trim()

    setPending({ type, message })
    setActionError('')
    setLocked({ target: lockTarget, when: lockWhen })

    if (type === 'cancel') {
      setDraft('')
      setTarget('all')
      setWhen('now')
      setSendAt('')
      setSendTime('')
      setSenderMode('keep')
      setSender('')
      setErrors({})
      return
    }

    setDraft(type === 'reblast' ? defaultReblastMessage(message) : defaultResendMessage(message))
    setTarget(nextTarget)
    setWhen(nextWhen)
    setSendAt('')
    setSendTime(nextWhen === 'later' ? '09:00' : '')
    setSenderMode(originalSender ? 'keep' : 'change')
    setSender(originalSender)
    setErrors({})
  }

  function close() {
    if (busy) return
    resetForm()
  }

  function changeTarget(next) {
    if (locked.target) return
    setTarget(next)
    setErrors({})
    if (next === 'failed') {
      setWhen('now')
      setSendAt('')
      setSendTime('')
    }
  }

  function changeWhen(next) {
    if (locked.when) return
    setWhen(next)
    setErrors({})
    if (next === 'now') {
      setSendAt('')
      setSendTime('')
    } else if (!sendTime) {
      setSendTime('09:00')
    }
  }

  function changeSenderMode(next) {
    setSenderMode(next)
    setErrors((current) => ({ ...current, sender: undefined }))
    if (next === 'keep') {
      setSender(String(pending?.message?.sender ?? '').trim())
    } else if (!sender || sender === pending?.message?.sender) {
      const firstOther = approved.find((name) => name !== pending?.message?.sender)
      setSender(firstOther || '')
    }
  }

  async function confirm() {
    if (!pending || busy) return
    const { type, message } = pending

    if (type === 'cancel') {
      setActionError('')
      try {
        const result = await cancelSms(message.id).unwrap()
        notify.success(result.message || 'Scheduled message cancelled.')
        resetForm()
        onDone?.(result)
      } catch (error) {
        setActionError(apiErrorMessage(error) || 'Cancel failed.')
      }
      return
    }

    const bulk = message.kind === 'groups'
    const messageText = draft.trim()
    const from = resolveFrom({ senderMode, sender, message })

    if (!from) {
      setErrors((current) => ({
        ...current,
        sender: senderMode === 'change' ? 'Choose a sender ID.' : 'Original sender ID is missing.',
      }))
      return
    }

    if (type === 'resend') {
      if (!messageText) {
        notify.error('Enter a message to send.')
        return
      }
      const scheduleErrors = validateSchedule({ when, sendAt, sendTime })
      setErrors(scheduleErrors)
      if (Object.keys(scheduleErrors).length) return

      try {
        const result = await resendSms({
          smsId: message.id,
          body: resendSmsBody({ message: messageText, from, when, sendAt, sendTime }),
        }).unwrap()
        notify.success(result.message || (when === 'later' ? 'Message scheduled.' : 'Message queued for sending.'))
        resetForm()
        onDone?.(result)
      } catch (error) {
        notify.error(apiErrorMessage(error) || 'Resend failed.')
      }
      return
    }

    const scheduleErrors = bulk && target === 'all' ? validateSchedule({ when, sendAt, sendTime }) : {}
    setErrors(scheduleErrors)
    if (Object.keys(scheduleErrors).length) return

    if (target === 'failed' && reblastRecipientCount(message, 'failed') < 1) {
      notify.error('There are no failed recipients to send to.')
      return
    }

    if (!(bulk && (target === 'failed' || when === 'later')) && !messageText) {
      notify.error('Enter a message to send.')
      return
    }

    try {
      const body = reblastSmsBody({
        kind: message.kind,
        message: draft,
        from,
        target: bulk ? target : undefined,
        when: bulk && target === 'all' ? when : 'now',
        sendAt,
        sendTime,
      })
      const result = await reblastSms({ smsId: message.id, body }).unwrap()
      notify.success(result.message || (when === 'later' ? 'Message scheduled.' : 'Message queued for sending.'))
      resetForm()
      onDone?.(result)
    } catch (error) {
      notify.error(apiErrorMessage(error) || 'Reblast failed.')
    }
  }

  const recipientCount =
    pending && pending.type !== 'cancel'
      ? pending.type === 'reblast'
        ? reblastRecipientCount(pending.message, target)
        : reblastRecipientCount(pending.message, 'all')
      : 0

  let dialog = null
  if (pending?.type === 'cancel') {
    dialog = (
      <ConfirmDialog
        title="Cancel scheduled message?"
        description={
          <>
            This stops the send before it goes out and refunds the SMS units for{' '}
            <span className="font-semibold text-navy">{pending.message.name || 'this message'}</span>.
          </>
        }
        confirmLabel="Cancel message"
        busyLabel="Cancelling…"
        tone="warning"
        busy={busy}
        error={actionError}
        onConfirm={confirm}
        onClose={close}
      />
    )
  } else if (pending) {
    dialog = (
      <MessageActionDialog
        type={pending.type}
        message={pending.message}
        recipientCount={recipientCount}
        draft={draft}
        onDraftChange={setDraft}
        target={target}
        onTargetChange={changeTarget}
        when={when}
        onWhenChange={changeWhen}
        sendAt={sendAt}
        onSendAtChange={(value) => {
          setSendAt(value)
          setErrors((current) => ({ ...current, sendAt: undefined }))
        }}
        sendTime={sendTime}
        onSendTimeChange={(value) => {
          setSendTime(value)
          setErrors((current) => ({ ...current, sendTime: undefined }))
        }}
        senderMode={senderMode}
        onSenderModeChange={changeSenderMode}
        sender={sender}
        onSenderChange={(value) => {
          setSender(value)
          setErrors((current) => ({ ...current, sender: undefined }))
        }}
        senders={approved}
        sendersLoading={sendersQuery.isLoading}
        sendersError={sendersQuery.isError ? apiErrorMessage(sendersQuery.error) : ''}
        onRetrySenders={sendersQuery.refetch}
        lockTarget={locked.target}
        lockWhen={locked.when}
        errors={errors}
        busy={busy}
        onConfirm={confirm}
        onClose={close}
      />
    )
  }

  return {
    ask,
    dialog,
    busy,
    canReblast: canReblastMessage,
    canResend: canResendMessage,
    canCancel: canCancelMessage,
  }
}
