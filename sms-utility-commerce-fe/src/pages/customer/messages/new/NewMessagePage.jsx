import { ArrowLeft, ArrowRight, CalendarClock, Send } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { messageCreated } from '../../../../features/messages/messagesSlice'
import { selectWalletBalance, walletDebited } from '../../../../features/wallet/walletSlice'
import { paths } from '../../../../routes/paths'
import { useDocumentTitle } from '../../../../utils/hooks/useDocumentTitle'
import { useDisclosure } from '../../../../utils/hooks/useDisclosure'
import { segmentCount } from '../../campaigns/model'
import { MessageStep } from '../../campaigns/new/MessageStep'
import { StepError, useErrorFocus } from '../../campaigns/new/StepError'
import { validateMessage } from '../../campaigns/new/validate'
import { useGroups } from '../../contacts/useGroups'
import { approvedSenderNames } from '../../sender-ids/model'
import { useSenderIds } from '../../sender-ids/useSenderIds'
import { smsCostUnits } from '../../wallet/money'
import { TopUpDrawer } from '../../wallet/sections/TopUpDrawer'
import { parseNumberList, validateGroups, validateNumbers } from '../model'
import { AudienceFields } from './AudienceFields'
import { ReviewFields } from './ReviewFields'

const steps = ['Audience', 'Message', 'Review']
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`
const secondary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-canvas ${focusClass}`

const errorFields = [
  ['numbers', 'Numbers', 'message-numbers-input'],
  ['groupIds', 'Groups', 'message-groups'],
  ['name', 'Message name', 'campaign-name-input'],
  ['type', 'Type', 'campaign-type'],
  ['sender', 'Sender', 'campaign-sender'],
  ['body', 'Message', 'campaign-body-input'],
  ['sendAt', 'Send time', 'campaign-send-at-input'],
]

const empty = {
  kind: 'numbers',
  numbers: '',
  groupIds: [],
  name: '',
  type: 'promotional',
  sender: 'UTILISMS',
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
  const groups = useGroups()
  const approved = approvedSenderNames(useSenderIds())
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [attempt, setAttempt] = useState(0)
  const summaryRef = useErrorFocus(attempt)

  const selectedGroups = groups.filter((group) => values.groupIds.includes(group.id))
  const parsed = parseNumberList(values.numbers)
  const balance = useSelector(selectWalletBalance)
  const topUp = useDisclosure()
  const recipients = values.kind === 'numbers' ? parsed.valid.length : selectedGroups.reduce((sum, group) => sum + group.breakdown.active, 0)
  const cost = smsCostUnits({ segments: segmentCount(values.body.trim()), recipients })
  const short = cost > balance

  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key] && key !== 'kind') return current
      const next = { ...current, [key]: undefined }
      if (key === 'kind') {
        next.numbers = undefined
        next.groupIds = undefined
      }
      return next
    })
  }

  function audienceErrors() {
    return values.kind === 'numbers' ? validateNumbers(values.numbers) : validateGroups(selectedGroups)
  }

  function messageErrors() {
    return validateMessage(values, new Date(), { nameError: 'Enter a message name.', senders: approved })
  }

  function fail(found) {
    setErrors(found)
    setAttempt((count) => count + 1)
  }

  function submit(event) {
    event.preventDefault()

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
    if (short) {
      topUp.open()
      return
    }
    const id = crypto.randomUUID()
    if (cost > 0) {
      dispatch(
        walletDebited({
          id: crypto.randomUUID(),
          reference: crypto.randomUUID(),
          amount: cost,
          description: `SMS · ${values.name.trim()}`,
          createdAt: new Date().toISOString(),
          relatedId: id,
          relatedKind: 'message',
        }),
      )
    }
    dispatch(
      messageCreated({
        id,
        name: values.name.trim(),
        kind: values.kind,
        type: values.type,
        sender: values.sender,
        body,
        segments: segmentCount(body),
        recipients: values.kind === 'numbers' ? parsed.valid.length : selectedGroups.reduce((sum, group) => sum + group.breakdown.active, 0),
        numbers: values.kind === 'numbers' ? parsed.valid : [],
        groups:
          values.kind === 'groups'
            ? selectedGroups.map((group) => ({ id: group.id, name: group.name, active: group.breakdown.active }))
            : [],
        sendAt: values.when === 'later' ? values.sendAt : null,
        status: values.when === 'later' ? 'scheduled' : 'in_progress',
        createdAt: new Date().toISOString(),
      }),
    )
    navigate(paths.message(id))
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
          {step === 1 ? <MessageStep values={values} errors={errors} onChange={change} nameLabel="Message name" senders={approved} /> : null}
          {step === 2 ? (
            <ReviewFields values={values} groups={selectedGroups} numbers={parsed.valid} cost={cost} balance={balance} onTopUp={topUp.open} />
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setErrors({})
                setStep((current) => current - 1)
              }}
              className={secondary}
            >
              <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" disabled={step === 2 && short} className={`${primary} disabled:cursor-not-allowed disabled:bg-ink/20`}>
            {step < 2 ? (
              <>
                Continue
                <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
              </>
            ) : values.when === 'later' ? (
              <>
                <CalendarClock size={16} strokeWidth={2.3} aria-hidden="true" />
                Schedule message
              </>
            ) : (
              <>
                <Send size={16} strokeWidth={2.3} aria-hidden="true" />
                Send message
              </>
            )}
          </button>
        </div>
      </form>
      {topUp.isOpen ? <TopUpDrawer onClose={topUp.close} /> : null}
    </div>
  )
}
