import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { apiErrorMessage } from '../../../../features/auth/client'
import { messageCreated } from '../../../../features/messages/messagesSlice'
import { useNotify } from '../../../../features/notifications/useNotify'
import { selectWalletBalance, walletDebited } from '../../../../features/wallet/walletSlice'
import { paths } from '../../../../routes/paths'
import { useSendBulkSmsMutation, useSendQuickSmsMutation } from '../../../../services/api/messages/messagesApi'
import { useGetSenderIdsQuery } from '../../../../services/api/sender-ids/senderIdsApi'
import { useDocumentTitle } from '../../../../utils/hooks/useDocumentTitle'
import { segmentCount } from '../../campaigns/model'
import { MessageStep } from '../../campaigns/new/MessageStep'
import { StepError, useErrorFocus } from '../../campaigns/new/StepError'
import { validateMessage } from '../../campaigns/new/validate'
import { useGroups } from '../../contacts/useGroups'
import { approvedSenderNames } from '../../sender-ids/model'
import { smsCostUnits } from '../../wallet/money'
import {
  bulkSmsBody,
  messageFromBulkSend,
  messageFromQuickSend,
  parseNumberList,
  quickSmsBody,
  validateGroups,
  validateNumbers,
} from '../model'
import { AudienceFields } from './AudienceFields'
import { ReviewFields } from './ReviewFields'

const steps = ['Audience', 'Message', 'Review']
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`
const secondary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-canvas ${focusClass}`

const errorFields = [
  ['numbers', 'Numbers', 'message-numbers-input'],
  ['groupIds', 'Groups', 'message-groups'],
  ['sender', 'Sender', 'campaign-sender'],
  ['body', 'Message', 'campaign-body-input'],
  ['submit', 'Send', 'message-submit'],
]

const empty = {
  kind: 'numbers',
  numbers: '',
  groupIds: [],
  name: '',
  type: 'promotional',
  customType: '',
  sender: '',
  body: '',
  when: 'now',
  sendAt: '',
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-3" aria-label="New message">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label} className="flex-1" aria-current={active ? 'step' : undefined}>
            <span className="block h-1 overflow-hidden rounded-full bg-ink/10">
              <span className={`block h-full rounded-full bg-blue ${done || active ? 'w-full' : 'w-0'}`} />
            </span>
            <span className={`mt-2 block text-xs font-medium ${active ? 'text-navy' : 'text-ink/45'}`}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function NewMessagePage() {
  useDocumentTitle('New message')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notify = useNotify()
  const { groups } = useGroups()
  const sendersQuery = useGetSenderIdsQuery({ page: 1, perPage: 100, status: 'approved' })
  const approved = approvedSenderNames(sendersQuery.data?.rows ?? [])
  const [sendQuickSms, { isLoading: sendingQuick }] = useSendQuickSmsMutation()
  const [sendBulkSms, { isLoading: sendingBulk }] = useSendBulkSmsMutation()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [attempt, setAttempt] = useState(0)
  const summaryRef = useErrorFocus(attempt)

  const selectedGroups = groups.filter((group) => values.groupIds.includes(group.id))
  const parsed = parseNumberList(values.numbers)
  const balance = useSelector(selectWalletBalance)
  const recipients =
    values.kind === 'numbers' ? parsed.valid.length : selectedGroups.reduce((sum, group) => sum + group.breakdown.active, 0)
  const cost = smsCostUnits({ segments: segmentCount(values.body.trim()), recipients })
  const toNumbers = values.kind === 'numbers'
  const busy = sendingQuick || sendingBulk

  const senderSource = approved.join('\0')
  const [seenSenders, setSeenSenders] = useState(senderSource)
  if (seenSenders !== senderSource) {
    setSeenSenders(senderSource)
    if (approved.length && (!values.sender || !approved.includes(values.sender))) {
      setValues((current) => ({ ...current, sender: approved[0] }))
    }
  }

  function change(key, value) {
    setValues((current) => {
      const next = { ...current, [key]: value }
      if (key === 'kind') {
        next.when = 'now'
        next.sendAt = ''
      }
      return next
    })
    setErrors((current) => {
      if (!current[key] && key !== 'kind' && !current.submit) return current
      const next = { ...current, [key]: undefined, submit: undefined }
      if (key === 'kind') {
        next.numbers = undefined
        next.groupIds = undefined
      }
      return next
    })
  }

  function audienceErrors() {
    return toNumbers ? validateNumbers(values.numbers) : validateGroups(selectedGroups)
  }

  function messageErrors() {
    const found = validateMessage(
      { ...values, when: 'now', sendAt: '' },
      new Date(),
      {
        senders: approved,
        requireName: false,
        requireType: false,
      },
    )
    if (!approved.length) found.sender = 'Approve a sender ID before sending.'
    return found
  }

  function fail(found) {
    setErrors(found)
    setAttempt((count) => count + 1)
  }

  function finishLocalMessage(record) {
    const debit = Number.isFinite(record.unitsUsed) ? record.unitsUsed : cost
    if (debit > 0) {
      dispatch(
        walletDebited({
          id: crypto.randomUUID(),
          reference: crypto.randomUUID(),
          amount: debit,
          description: `SMS · ${record.name}`,
          createdAt: new Date().toISOString(),
          relatedId: record.id,
          relatedKind: 'message',
        }),
      )
    }
    dispatch(messageCreated(record))
    navigate(paths.message(record.id))
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return

    if (step === 0) {
      const found = audienceErrors()
      if (Object.keys(found).length > 0) {
        fail(found)
        return
      }
      setErrors({})
      setStep(1)
      return
    }

    if (step === 1) {
      const found = messageErrors()
      if (Object.keys(found).length > 0) {
        fail(found)
        return
      }
      setErrors({})
      setStep(2)
      return
    }

    const found = { ...audienceErrors(), ...messageErrors() }
    if (Object.keys(found).length > 0) {
      fail(found)
      setStep(found.numbers || found.groupIds ? 0 : 1)
      return
    }

    const body = values.body.trim()
    const segments = segmentCount(body)

    try {
      if (toNumbers) {
        const result = await sendQuickSms(
          quickSmsBody({
            from: values.sender,
            numbers: parsed.valid,
            message: body,
          }),
        ).unwrap()
        notify.success(result.message || 'Message sent.')
        finishLocalMessage(
          messageFromQuickSend({
            values,
            numbers: parsed.valid,
            result,
            segments,
          }),
        )
        return
      }

      const result = await sendBulkSms(
        bulkSmsBody({
          from: values.sender,
          groups: selectedGroups,
          message: body,
        }),
      ).unwrap()
      notify.success(result.message || 'Message queued for sending.')
      finishLocalMessage(
        messageFromBulkSend({
          values,
          groups: selectedGroups,
          result,
          segments,
        }),
      )
    } catch (error) {
      const message = apiErrorMessage(error)
      fail({ submit: message })
      notify.error(message)
    }
  }

  return (
    <div className="w-full">
      <header>
        <p className="text-sm font-medium text-ink/55">
          <Link
            to={paths.messages}
            className="rounded-sm text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Messages
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">New message</h1>
      </header>

      <form
        noValidate
        onSubmit={submit}
        className="mt-6 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6"
      >
        <Stepper current={step} />
        <div className="mt-6">
          <StepError errors={errors} summaryRef={summaryRef} fields={errorFields} />
          {step === 0 ? <AudienceFields groups={groups} values={values} errors={errors} onChange={change} /> : null}
          {step === 1 ? (
            <MessageStep
              values={values}
              errors={errors}
              onChange={change}
              senders={approved}
              sendersLoading={sendersQuery.isLoading}
              sendersError={sendersQuery.isError ? apiErrorMessage(sendersQuery.error) : ''}
              onRetrySenders={sendersQuery.refetch}
              allowSchedule={false}
              showPlaceholders={!toNumbers}
              showName={false}
              showType={false}
            />
          ) : null}
          {step === 2 ? (
            <ReviewFields
              values={values}
              groups={selectedGroups}
              numbers={parsed.valid}
              cost={cost}
              balance={balance}
              immediate
            />
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-5">
          {step > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setErrors({})
                setStep((current) => current - 1)
              }}
              className={`${secondary} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            id="message-submit"
            type="submit"
            disabled={busy || (step === 1 && sendersQuery.isLoading)}
            aria-busy={busy || undefined}
            className={`${primary} disabled:cursor-not-allowed disabled:bg-ink/20`}
          >
            {step < 2 ? (
              <>
                Continue
                <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
              </>
            ) : busy ? (
              'Sending…'
            ) : (
              <>
                <Send size={16} strokeWidth={2.3} aria-hidden="true" />
                Send message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
