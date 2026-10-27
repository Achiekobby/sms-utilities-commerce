import { ArrowLeft, ArrowRight, CalendarClock, Send } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { campaignCreated } from '../../../../features/campaigns/campaignsSlice'
import { paths } from '../../../../routes/paths'
import { useDocumentTitle } from '../../../../utils/hooks/useDocumentTitle'
import { useGroups } from '../../contacts/useGroups'
import { approvedSenderNames } from '../../sender-ids/model'
import { useSenderIds } from '../../sender-ids/useSenderIds'
import { segmentCount } from '../model'
import { AudienceStep } from './AudienceStep'
import { MessageStep } from './MessageStep'
import { ReviewStep } from './ReviewStep'
import { StartStep } from './StartStep'
import { StepError, useErrorFocus } from './StepError'
import { validateAudience, validateMessage } from './validate'

const steps = ['Start', 'Audience', 'Message', 'Review']
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`
const secondary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-canvas ${focusClass}`

const empty = {
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
    <ol className="flex items-center gap-3" aria-label="Create campaign">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label} className="flex-1" aria-current={active ? 'step' : undefined}>
            <span className="block h-1 overflow-hidden rounded-full bg-ink/10">
              <span className={`block h-full rounded-full bg-blue ${done || active ? 'w-full' : 'w-0'}`} />
            </span>
            <span className={`mt-2 block text-xs font-medium ${active ? 'text-navy' : 'text-ink/45'}`}>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function fromTemplate(template) {
  if (!template?.body) return null
  return {
    ...empty,
    name: template.name ?? '',
    type: template.type ?? empty.type,
    sender: template.sender ?? empty.sender,
    body: template.body,
    templateName: template.name ?? '',
  }
}

export function NewCampaignPage() {
  useDocumentTitle('Create campaign')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const applied = fromTemplate(location.state?.template)
  const groups = useGroups()
  const approved = approvedSenderNames(useSenderIds())
  const [step, setStep] = useState(applied ? 2 : 0)
  const [values, setValues] = useState(applied ?? empty)
  const [errors, setErrors] = useState({})
  const [attempt, setAttempt] = useState(0)
  const summaryRef = useErrorFocus(attempt)
  const selectedGroups = groups.filter((group) => values.groupIds.includes(group.id))

  function toggleGroup(id) {
    const next = values.groupIds.includes(id)
      ? values.groupIds.filter((item) => item !== id)
      : [...values.groupIds, id]
    change('groupIds', next)
  }

  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  function fail(found) {
    setErrors(found)
    setAttempt((count) => count + 1)
  }

  function submit(event) {
    event.preventDefault()

    if (step === 1) {
      const found = validateAudience(selectedGroups)
      if (Object.keys(found).length > 0) {
        fail(found)
        return
      }
      setErrors({})
      setStep(2)
      return
    }

    if (step === 2) {
      const found = validateMessage(values, new Date(), { senders: approved })
      if (Object.keys(found).length > 0) {
        fail(found)
        return
      }
      const audience = validateAudience(selectedGroups)
      if (Object.keys(audience).length > 0) {
        fail(audience)
        setStep(1)
        return
      }
      setErrors({})
      setStep(3)
      return
    }

    const found = { ...validateAudience(selectedGroups), ...validateMessage(values, new Date(), { senders: approved }) }
    if (Object.keys(found).length > 0) {
      fail(found)
      setStep(found.groupIds ? 1 : 2)
      return
    }

    const body = values.body.trim()
    const id = crypto.randomUUID()
    const audience = selectedGroups.map((group) => ({
      id: group.id,
      name: group.name,
      active: group.breakdown.active,
    }))
    dispatch(
      campaignCreated({
        id,
        name: values.name.trim(),
        type: values.type,
        groups: audience,
        groupName: audience.map((group) => group.name).join(', '),
        recipients: audience.reduce((sum, group) => sum + group.active, 0),
        sender: values.sender,
        body,
        segments: segmentCount(body),
        sendAt: values.when === 'later' ? values.sendAt : null,
        status: values.when === 'later' ? 'scheduled' : 'in_progress',
        createdAt: new Date().toISOString(),
      }),
    )
    navigate(paths.campaign(id))
  }

  return (
    <div className="w-full">
      <header>
        <p className="text-sm font-medium text-ink/55">
          <Link
            to={paths.campaigns}
            className="rounded-sm text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Campaigns
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Create campaign</h1>
      </header>

      <form noValidate onSubmit={submit} className="mt-6 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6">
        <Stepper current={step} />
        <div className="mt-6">
          <StepError errors={errors} summaryRef={summaryRef} />
          {step === 0 ? (
            <StartStep
              onScratch={() => {
                setValues(empty)
                setErrors({})
                setStep(1)
              }}
            />
          ) : null}
          {step === 1 ? (
            <AudienceStep groups={groups} groupIds={values.groupIds} error={errors.groupIds} onToggle={toggleGroup} />
          ) : null}
          {step === 2 ? (
            <>
              {values.templateName ? (
                <p className="mb-4 rounded-xl bg-[#E7F1FC] px-4 py-3 text-sm leading-6 text-navy">
                  Using {values.templateName}. Change anything that should not go out as written.
                </p>
              ) : null}
              <MessageStep values={values} errors={errors} onChange={change} senders={approved} />
            </>
          ) : null}
          {step === 3 ? <ReviewStep values={values} groups={selectedGroups} /> : null}
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
          {step > 0 ? (
            <button type="submit" className={primary}>
              {step < 3 ? (
                <>
                  Continue
                  <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
                </>
              ) : values.when === 'later' ? (
                <>
                  <CalendarClock size={16} strokeWidth={2.3} aria-hidden="true" />
                  Schedule campaign
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={2.3} aria-hidden="true" />
                  Send campaign
                </>
              )}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
