import {
  CalendarClock,
  Cake,
  Gift,
  Link2,
  Megaphone,
  MessageSquareText,
  Pencil,
  Users,
  Wallet,
} from 'lucide-react'
import { IPhoneMockup } from 'react-device-mockup'
import { TypeBadge } from '../../../../components/TypeBadge'
import { formatCount } from '../../dashboard/format'
import { formatUnits } from '../../wallet/money'
import { SmsChargeNote } from '../../wallet/sections/SmsChargeNote'
import { ctaTypeMeta, formatCtaSummary, formatCtaValue } from '../cta'
import {
  formatCreated,
  formatSendAt,
  formatSendTime,
  occasionTypeLabel,
  sampleMessage,
  segmentCount,
  triggerOffsetLabel,
  typeLabel,
} from '../model'
import {
  estimateRewardEligibility,
  formatRewardMoney,
  formatRewardValue,
  rewardAmountCedis,
  rewardCostUnits,
  rewardPlaceholders,
  rewardTypeMeta,
} from '../reward'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function scheduleSummary(values) {
  if (values.type === 'occasion') {
    const offset =
      values.triggerOffset === 'custom'
        ? `${values.customOffsetDays || '—'} days before`
        : triggerOffsetLabel(values.triggerOffset)
    const occasion =
      values.occasionType === 'custom' && values.customDate
        ? `Custom date (${formatCreated(`${values.customDate}T12:00:00`)})`
        : occasionTypeLabel(values.occasionType)
    return `${occasion} · ${offset} at ${formatSendTime(values.sendTime)}${
      values.repeatYearly ? ' · Every year' : ''
    }`
  }
  return values.when === 'later' ? formatSendAt(values.sendAt) : 'Send now'
}

function ReviewCard({ icon: Icon, title, onEdit, children, tone = 'bg-[#F3F6FB] text-blue' }) {
  return (
    <section className="rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <h3 className="text-sm font-bold text-navy">{title}</h3>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-blue hover:bg-blue/[0.06] ${focusClass}`}
          >
            <Pencil size={13} strokeWidth={2.2} aria-hidden="true" />
            Edit
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-navy">{value}</dd>
    </div>
  )
}

function PhonePreview({ sender, body, reward }) {
  const preview = sampleMessage(body, rewardPlaceholders(reward))

  return (
    <aside className="flex flex-col items-center">
      <div className="w-full max-w-[17rem]">
        <IPhoneMockup screenWidth={240} screenType="island" frameColor="#1c1c1e" statusbarColor="#f2f4f7" hideNavBar>
          <div className="flex h-full flex-col bg-[#f2f4f7] text-left">
            <div className="border-b border-black/5 bg-white px-4 pt-2 pb-3">
              <p className="text-center text-[11px] font-medium text-ink/40">Messages</p>
              <p className="mt-1 truncate text-center text-sm font-bold text-navy">{sender || 'Sender'}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <p className="mb-3 text-center text-[10px] font-medium text-ink/40">Today</p>
              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,33,61,0.08)]">
                <p className="whitespace-pre-wrap text-[13px] leading-5 text-ink">
                  {preview.trim() || 'Your message preview will appear here.'}
                </p>
                <p className="mt-1.5 text-right text-[10px] text-ink/40">Now</p>
              </div>
            </div>
          </div>
        </IPhoneMockup>
      </div>
      <p className="mt-4 max-w-[16rem] text-center text-xs leading-5 text-ink/55">
        Sample as a contact would read it, with personalization filled in.
      </p>
    </aside>
  )
}

export function ReviewStep({ values, groups, cost, balance, onTopUp, onEdit }) {
  const segments = segmentCount(values.body.trim())
  const recipients = groups.reduce((sum, group) => sum + group.breakdown.active, 0)
  const estimated = recipients * Math.max(segments, 1)
  const action =
    values.type === 'occasion' ? 'activate' : values.when === 'later' ? 'schedule' : 'send'
  const TypeIcon = values.type === 'occasion' ? Cake : Megaphone
  const reward = values.reward
  const eligibility = reward?.enabled ? estimateRewardEligibility(recipients) : null
  const rewardCost = reward?.enabled ? rewardCostUnits(reward, eligibility.eligible) : 0
  const perRecipient = reward?.enabled ? rewardAmountCedis(reward) : 0
  const campaignTotal = cost + rewardCost

  return (
    <div>
      <h2 className="text-base font-bold text-navy sm:text-lg">Review</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
        Confirm the details before you {action} this campaign.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] lg:items-start">
        <div className="space-y-3">
          <ReviewCard
            icon={TypeIcon}
            title="Campaign"
            tone={values.type === 'occasion' ? 'bg-[#FFE8D6] text-[#C2410C]' : 'bg-[#E7F1FC] text-blue'}
            onEdit={onEdit ? () => onEdit(2) : undefined}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-bold text-navy">{values.name.trim() || 'Untitled campaign'}</p>
              <TypeBadge type={values.type} />
            </div>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Meta label="Sender" value={values.sender || '—'} />
              <Meta label="Type" value={typeLabel(values.type)} />
            </dl>
          </ReviewCard>

          <ReviewCard icon={Users} title="Audience" onEdit={onEdit ? () => onEdit(1) : undefined}>
            {groups.length ? (
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li
                    key={group.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-canvas/50 px-3 py-2.5"
                  >
                    <span className="text-sm font-semibold text-navy">{group.name}</span>
                    <span className="text-xs font-medium text-ink/55 tabular-nums">
                      {formatCount(group.breakdown.active)} active
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/55">No groups selected.</p>
            )}
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Meta label="SMS recipients" value={formatCount(recipients)} />
              {eligibility ? <Meta label="Reward recipients" value={formatCount(eligibility.eligible)} /> : null}
            </dl>
          </ReviewCard>

          {reward?.enabled ? (
            <ReviewCard
              icon={Gift}
              title="Reward"
              tone="bg-[#E8F8EF] text-green"
              onEdit={onEdit ? () => onEdit(1) : undefined}
            >
              <dl className="grid gap-3 sm:grid-cols-2">
                <Meta label="Type" value={rewardTypeMeta(reward.type)?.label ?? '—'} />
                <Meta label="Value" value={formatRewardValue(reward)} />
                <Meta label="Eligible recipients" value={formatCount(eligibility.eligible)} />
                <Meta
                  label="Per recipient"
                  value={perRecipient > 0 ? formatRewardMoney(perRecipient) : '—'}
                />
              </dl>
              <div className="mt-3 rounded-xl bg-[#F3FBF6] px-3.5 py-3">
                <p className="text-xs font-medium text-ink/50">Estimated reward total</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-navy">{formatUnits(rewardCost)}</p>
              </div>
              {values.type === 'occasion' && values.repeatYearly ? (
                <p className="mt-3 text-[13px] leading-5 text-[#8A4B08]">
                  This reward repeats each year for eligible contacts when the occasion fires. Actual costs may vary.
                </p>
              ) : null}
            </ReviewCard>
          ) : null}

          <ReviewCard
            icon={MessageSquareText}
            title="Message"
            onEdit={onEdit ? () => onEdit(2) : undefined}
          >
            <p className="rounded-xl bg-canvas px-3.5 py-3 text-sm leading-6 whitespace-pre-wrap text-ink">
              {values.body.trim() || '—'}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <Meta label="Characters" value={formatCount(values.body.trim().length)} />
              <Meta
                label="Segments"
                value={`${formatCount(segments)} ${segments === 1 ? 'segment' : 'segments'}`}
              />
            </dl>
          </ReviewCard>

          {values.type === 'promotion' && values.cta?.enabled ? (
            <ReviewCard
              icon={Link2}
              title="Call to action"
              tone="bg-[#EEF2F7] text-navy"
              onEdit={onEdit ? () => onEdit(2) : undefined}
            >
              <dl className="grid gap-3 sm:grid-cols-2">
                <Meta label="Type" value={ctaTypeMeta(values.cta.type)?.label ?? '—'} />
                <Meta label="Destination" value={formatCtaValue(values.cta)} />
                {values.cta.label ? <Meta label="Prompt" value={values.cta.label} /> : null}
                {reward?.enabled ? (
                  <Meta
                    label="Reward trigger"
                    value={values.cta.triggersReward ? 'On CTA use' : 'Not linked to reward'}
                  />
                ) : null}
              </dl>
              <p className="mt-3 text-[13px] text-ink/55">{formatCtaSummary(values.cta)}</p>
            </ReviewCard>
          ) : null}

          <ReviewCard
            icon={CalendarClock}
            title={values.type === 'occasion' ? 'Trigger' : 'Schedule'}
            onEdit={onEdit ? () => onEdit(3) : undefined}
          >
            <p className="text-sm font-semibold leading-6 text-navy">{scheduleSummary(values)}</p>
          </ReviewCard>
        </div>

        <div className="self-start lg:sticky lg:top-4 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
          <div className="rounded-2xl border border-[#D8E7FA] bg-[linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_45%)] px-4 py-5 sm:px-5">
            <p className="text-center text-xs font-semibold tracking-wide text-ink/45 uppercase">Phone preview</p>
            <div className="mt-4 flex justify-center">
              <PhonePreview sender={values.sender} body={values.body} reward={reward} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ReviewCard icon={Wallet} title="Estimated usage">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-canvas px-4 py-3">
              <Meta label="SMS cost" value={formatUnits(cost)} />
            </div>
            {reward?.enabled ? (
              <div className="rounded-xl bg-canvas px-4 py-3">
                <Meta label="Reward cost" value={formatUnits(rewardCost)} />
              </div>
            ) : (
              <div className="rounded-xl bg-canvas px-4 py-3">
                <Meta label="SMS volume" value={formatCount(estimated)} />
              </div>
            )}
            <div className="rounded-xl bg-canvas px-4 py-3">
              <Meta label={reward?.enabled ? 'Estimated campaign total' : 'Wallet'} value={formatUnits(reward?.enabled ? campaignTotal : balance)} />
            </div>
          </dl>
          {reward?.enabled ? (
            <dl className="mt-3 grid gap-2 rounded-xl border border-ink/10 px-4 py-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 sm:block">
                <dt className="text-ink/55">Available balance</dt>
                <dd className="font-semibold tabular-nums text-navy sm:mt-0.5">{formatUnits(balance)}</dd>
              </div>
              <div className="flex justify-between gap-3 sm:block">
                <dt className="text-ink/55">SMS volume</dt>
                <dd className="font-semibold tabular-nums text-navy sm:mt-0.5">{formatCount(estimated)}</dd>
              </div>
            </dl>
          ) : null}
          <div className="mt-3">
            <SmsChargeNote cost={cost + rewardCost} balance={balance} onTopUp={onTopUp} />
          </div>
        </ReviewCard>
      </div>
    </div>
  )
}
