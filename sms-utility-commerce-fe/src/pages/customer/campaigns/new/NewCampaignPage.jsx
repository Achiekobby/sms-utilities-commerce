import { ArrowLeft, ArrowRight, CalendarClock, Radio, Send } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { campaignCreated } from '../../../../features/campaigns/campaignsSlice'
import { selectWalletBalance, walletDebited } from '../../../../features/wallet/walletSlice'
import { paths } from '../../../../routes/paths'
import { useDocumentTitle } from '../../../../utils/hooks/useDocumentTitle'
import { useDisclosure } from '../../../../utils/hooks/useDisclosure'
import { useGroups } from '../../contacts/useGroups'
import { formatCount } from '../../dashboard/format'
import { approvedSenderNames } from '../../sender-ids/model'
import { useSenderIds } from '../../sender-ids/useSenderIds'
import { formatUnits, smsCostUnits, unitsPerCedi } from '../../wallet/money'
import { TopUpDrawer } from '../../wallet/sections/TopUpDrawer'
import { emptyCta, normalizeCampaignCta } from '../cta'
import { campaignTypes, segmentCount } from '../model'
import {
  emptyReward,
  estimateRewardEligibility,
  formatRewardMoney,
  normalizeCampaignReward,
  rewardAmountCedis,
  rewardCostUnits,
  rewardTypeMeta,
} from '../reward'
import { AudienceStep } from './AudienceStep'
import { MessageStep } from './MessageStep'
import { ReviewStep } from './ReviewStep'
import { ScheduleStep } from './ScheduleStep'
import { StepError, useErrorFocus } from './StepError'
import { TypeStep } from './TypeStep'
import { validateAudience, validateMessage, validateReward, validateSchedule, validateType } from './validate'

const steps = ['Type', 'Audience', 'Message', 'Schedule', 'Review']
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`
const secondary = `inline-flex h-11 cursor-pointer border border-ink/10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-canvas ${focusClass}`

const empty = {
  groupIds: [],
  name: '',
  type: '',
  occasionType: '',
  customDate: '',
  triggerOffset: 'on',
  customOffsetDays: '3',
  sendTime: '09:00',
  repeatYearly: true,
  sender: 'UTILISMS',
  body: '',
  when: 'now',
  sendAt: '',
  reward: emptyReward(),
  cta: emptyCta(),
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center" aria-label="Create campaign">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        const reached = done || active
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center" aria-current={active ? 'step' : undefined}>
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  reached
                    ? 'bg-blue text-white shadow-[0_1px_2px_rgba(20,115,230,0.35)]'
                    : 'bg-[#EEF2F7] text-ink/45'
                } ${active ? 'scale-105' : 'scale-100'}`}
              >
                {done ? '✓' : index + 1}
              </span>
              <span
                className={`hidden truncate text-sm font-semibold transition-colors duration-300 lg:inline ${
                  active ? 'text-navy' : 'text-ink/45'
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="mx-2 h-0.5 min-w-3 flex-1 overflow-hidden rounded-full bg-ink/10 sm:mx-3">
                <span
                  className={`block h-full rounded-full bg-blue transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    reached ? 'w-full' : 'w-0'
                  }`}
                />
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function fromTemplate(template, campaignType) {
  if (!template?.body) return null
  const type =
    campaignType && campaignTypes.some((item) => item.id === campaignType)
      ? campaignType
      : template.type === 'occasion' || template.type === 'promotion'
        ? template.type
        : 'promotion'

  // Templates may suggest a reward, but never silently enable financial disbursement.
  const suggested = template.suggestedReward
  const reward = suggested
    ? {
        ...emptyReward(),
        enabled: false,
        type: suggested.type || 'airtime',
        amount: suggested.amount != null ? String(suggested.amount) : '',
        airtimePreset: suggested.airtimePreset || '5',
        bundleId: suggested.bundleId || '1gb',
      }
    : emptyReward()

  return {
    ...empty,
    type,
    name: template.name ?? '',
    sender: template.sender ?? empty.sender,
    body: template.body,
    templateName: template.name ?? '',
    occasionType: type === 'occasion' ? template.occasionType || 'birthday' : '',
    repeatYearly: type === 'occasion',
    reward,
  }
}

export function NewCampaignPage() {
  useDocumentTitle('Create campaign')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const applied = fromTemplate(location.state?.template, location.state?.campaignType)
  const { groups } = useGroups()
  const approved = approvedSenderNames(useSenderIds())
  const [step, setStep] = useState(applied ? 1 : 0)
  const [values, setValues] = useState(applied ?? empty)
  const [errors, setErrors] = useState({})
  const [attempt, setAttempt] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const summaryRef = useErrorFocus(attempt)
  const selectedGroups = groups.filter((group) => values.groupIds.includes(group.id))
  const balance = useSelector(selectWalletBalance)
  const topUp = useDisclosure()
  const recipients = selectedGroups.reduce((sum, group) => sum + group.breakdown.active, 0)
  const smsCost = smsCostUnits({ segments: segmentCount(values.body.trim()), recipients })
  const eligibility = estimateRewardEligibility(recipients)
  const rewardCost = values.reward?.enabled ? rewardCostUnits(values.reward, eligibility.eligible) : 0
  const totalCost = smsCost + rewardCost
  const short = totalCost > balance
  const reviewStep = 4

  function change(key, value) {
    setValues((current) => {
      const next = { ...current, [key]: value }
      if (key === 'type' && value === 'promotion') {
        next.occasionType = ''
        next.customDate = ''
        next.triggerOffset = 'on'
        if (!next.cta) next.cta = emptyCta()
      }
      if (key === 'type' && value === 'occasion') {
        next.when = 'now'
        next.sendAt = ''
        if (!next.occasionType) next.occasionType = 'birthday'
        next.repeatYearly = true
        next.cta = emptyCta()
      }
      if (key === 'occasionType' && value !== 'custom') next.customDate = ''
      return next
    })
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }))
  }

  function fail(found) {
    setErrors(found)
    setAttempt((count) => count + 1)
  }

  function go(nextStep) {
    setErrors({})
    setStep(nextStep)
  }

  function createCampaign() {
    const body = values.body.trim()
    if (short) {
      setConfirmOpen(false)
      topUp.open()
      return
    }

    const id = crypto.randomUUID()
    const audience = selectedGroups.map((group) => ({
      id: group.id,
      name: group.name,
      active: group.breakdown.active,
    }))
    const isOccasion = values.type === 'occasion'
    const status = isOccasion ? 'active' : values.when === 'later' ? 'scheduled' : 'sending'
    const rewardPayload = values.reward?.enabled
      ? normalizeCampaignReward({
          ...values.reward,
          eligibleRecipients: eligibility.eligible,
          estimatedCost: rewardCost,
          notEligible: eligibility.notEligible,
        })
      : null

    if (totalCost > 0 && !isOccasion && values.when === 'now') {
      dispatch(
        walletDebited({
          id: crypto.randomUUID(),
          reference: crypto.randomUUID(),
          amount: totalCost,
          description: rewardPayload
            ? `SMS + reward · ${values.name.trim()}`
            : `SMS · ${values.name.trim()}`,
          createdAt: new Date().toISOString(),
          relatedId: id,
          relatedKind: 'campaign',
        }),
      )
    }

    dispatch(
      campaignCreated({
        id,
        name: values.name.trim(),
        type: values.type,
        occasionType: isOccasion ? values.occasionType : '',
        customDate: isOccasion && values.occasionType === 'custom' ? values.customDate : '',
        triggerOffset: isOccasion ? values.triggerOffset : '',
        customOffsetDays: isOccasion && values.triggerOffset === 'custom' ? Number(values.customOffsetDays) : null,
        sendTime: isOccasion ? values.sendTime : '',
        repeatYearly: isOccasion ? Boolean(values.repeatYearly) : false,
        groups: audience,
        groupName: audience.map((group) => group.name).join(', '),
        recipients: audience.reduce((sum, group) => sum + group.active, 0),
        rewardRecipients: rewardPayload?.eligibleRecipients ?? null,
        sender: values.sender,
        body,
        segments: segmentCount(body),
        sendAt: !isOccasion && values.when === 'later' ? values.sendAt : null,
        status,
        createdAt: new Date().toISOString(),
        reward: rewardPayload,
        cta: !isOccasion
          ? normalizeCampaignCta(values.cta, { hasReward: Boolean(rewardPayload) })
          : null,
      }),
    )
    navigate(paths.campaign(id), {
      state: {
        justCreated: true,
        outcome: isOccasion ? 'activated' : values.when === 'later' ? 'scheduled' : 'sent',
      },
    })
  }

  function submit(event) {
    event.preventDefault()

    if (step === 0) {
      const found = validateType(values)
      if (Object.keys(found).length) {
        fail(found)
        return
      }
      go(1)
      return
    }

    if (step === 1) {
      const found = {
        ...validateAudience(selectedGroups),
        ...validateReward(values, { smsRecipients: recipients, balance }),
      }
      if (Object.keys(found).length) {
        fail(found)
        return
      }
      go(2)
      return
    }

    if (step === 2) {
      const found = validateMessage(values, new Date(), { senders: approved, requireType: false })
      if (Object.keys(found).length) {
        fail(found)
        return
      }
      go(3)
      return
    }

    if (step === 3) {
      const found = validateSchedule(values)
      if (Object.keys(found).length) {
        fail(found)
        return
      }
      go(4)
      return
    }

    const found = {
      ...validateType(values),
      ...validateAudience(selectedGroups),
      ...validateReward(values, { smsRecipients: recipients, balance }),
      ...validateMessage(values, new Date(), { senders: approved, requireType: false }),
      ...validateSchedule(values),
    }
    if (Object.keys(found).length) {
      fail(found)
      if (found.type) setStep(0)
      else if (
        found.groupIds ||
        found.rewardType ||
        found.rewardAmount ||
        found.rewardBundle ||
        found.rewardBalance
      ) {
        setStep(1)
      }       else if (found.name || found.body || found.sender || found.ctaType || found.ctaValue) setStep(2)
      else setStep(3)
      return
    }

    if (short) {
      topUp.open()
      return
    }

    if (values.reward?.enabled) {
      setConfirmOpen(true)
      return
    }

    createCampaign()
  }

  const primaryLabel =
    step < reviewStep
      ? 'Continue'
      : values.type === 'occasion'
        ? 'Activate campaign'
        : values.when === 'later'
          ? 'Schedule campaign'
          : 'Send campaign'

  const rewardConfirmTitle =
    values.type === 'occasion'
      ? 'Activate campaign?'
      : values.when === 'later'
        ? 'Schedule campaign?'
        : 'Send campaign?'

  const per = rewardAmountCedis(values.reward)
  const rewardLabel = rewardTypeMeta(values.reward?.type)?.label?.toLowerCase() ?? 'reward'

  return (
    <div className="w-full">
      <header>
        <p className="text-sm font-medium text-ink/55">
          <Link to={paths.campaigns} className={`rounded-sm text-blue ${focusClass}`}>
            Campaigns
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Create campaign</h1>
      </header>

      <form
        noValidate
        onSubmit={submit}
        className="mt-6 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6"
      >
        <Stepper current={step} />
        <div className="mt-6">
          <StepError errors={errors} summaryRef={summaryRef} />
          <div key={step} className="campaign-step-in">
            {step === 0 ? (
              <TypeStep
                values={values}
                error={errors.type}
                onChange={change}
                onScratch={() => {
                  if (!values.type) {
                    fail(validateType(values))
                    return
                  }
                  go(1)
                }}
              />
            ) : null}
            {step === 1 ? (
              <AudienceStep
                groups={groups}
                groupIds={values.groupIds}
                error={errors.groupIds}
                values={values}
                rewardErrors={errors}
                onChange={change}
                balance={balance}
                onAddFunds={topUp.open}
                onToggle={(id) => {
                  const next = values.groupIds.includes(id)
                    ? values.groupIds.filter((item) => item !== id)
                    : [...values.groupIds, id]
                  change('groupIds', next)
                }}
              />
            ) : null}
            {step === 2 ? (
              <>
                {values.templateName ? (
                  <p className="mb-4 rounded-xl bg-[#E7F1FC] px-4 py-3 text-sm leading-6 text-navy">
                    Using {values.templateName}. Change anything that should not go out as written.
                    {location.state?.template?.suggestedReward && !values.reward?.enabled
                      ? ' This template suggests a reward — enable it on Audience if you want to include it.'
                      : null}
                  </p>
                ) : null}
                <MessageStep
                  values={values}
                  errors={errors}
                  onChange={change}
                  senders={approved}
                  showType={false}
                  allowSchedule={false}
                />
              </>
            ) : null}
            {step === 3 ? <ScheduleStep values={values} errors={errors} onChange={change} /> : null}
            {step === 4 ? (
              <ReviewStep
                values={values}
                groups={selectedGroups}
                cost={smsCost}
                balance={balance}
                onTopUp={topUp.open}
                onEdit={go}
              />
            ) : null}
          </div>
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
            <button
              type="submit"
              disabled={step === reviewStep && short}
              className={`${primary} disabled:cursor-not-allowed disabled:bg-ink/20`}
            >
              {step < reviewStep ? (
                <>
                  Continue
                  <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
                </>
              ) : values.type === 'occasion' ? (
                <>
                  <Radio size={16} strokeWidth={2.3} aria-hidden="true" />
                  {primaryLabel}
                </>
              ) : values.when === 'later' ? (
                <>
                  <CalendarClock size={16} strokeWidth={2.3} aria-hidden="true" />
                  {primaryLabel}
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={2.3} aria-hidden="true" />
                  {primaryLabel}
                </>
              )}
            </button>
          ) : null}
        </div>
      </form>
      {topUp.isOpen ? <TopUpDrawer onClose={topUp.close} /> : null}
      {confirmOpen ? (
        <ConfirmDialog
          tone="caution"
          title={rewardConfirmTitle}
          description={
            <div className="space-y-2">
              <p>
                This campaign will send an SMS to approximately {formatCount(recipients)} recipients
                {values.reward?.enabled
                  ? ` and ${per > 0 ? formatRewardMoney(per) : ''} ${rewardLabel} to approximately ${formatCount(eligibility.eligible)} eligible recipients`
                  : ''}
                .
              </p>
              {values.reward?.enabled ? (
                <p>
                  Estimated reward cost:{' '}
                  <span className="font-semibold text-navy tabular-nums">{formatUnits(rewardCost)}</span>
                  {values.reward.type === 'cash' || rewardCost >= 1000 * unitsPerCedi ? (
                    <>
                      . You are about to fund rewards worth approximately{' '}
                      <span className="font-semibold text-navy tabular-nums">{formatUnits(rewardCost)}</span>.
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          }
          confirmLabel={primaryLabel}
          busyLabel="Working…"
          onConfirm={() => {
            setConfirmOpen(false)
            createCampaign()
          }}
          onClose={() => setConfirmOpen(false)}
        />
      ) : null}
    </div>
  )
}
