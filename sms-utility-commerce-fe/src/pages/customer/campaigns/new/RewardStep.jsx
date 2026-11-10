import { Check, Info, Phone, Signal, Wallet } from 'lucide-react'
import { useState } from 'react'
import { formatCount } from '../../dashboard/format'
import { formatUnits } from '../../wallet/money'
import {
  airtimePresets,
  dataBundles,
  estimateRewardEligibility,
  formatRewardMoney,
  rewardAmountCedis,
  rewardCostUnits,
  rewardCurrencyLabel,
  rewardTypes,
} from '../reward'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none transition-all duration-200 placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'
const labelClass = 'mb-2 block text-sm font-medium text-navy'
const errorColor = '#E0232E'

const typeIcons = {
  cash: Wallet,
  airtime: Phone,
  data: Signal,
}

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
      {children}
    </p>
  )
}

function Toggle({ checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${focusClass} ${
        checked ? 'bg-green' : 'bg-ink/20'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function RewardStep({ values, errors, onChange, smsRecipients, balance, onAddFunds }) {
  const reward = values.reward
  const eligibility = estimateRewardEligibility(smsRecipients)
  const [showReasons, setShowReasons] = useState(false)
  const amount = rewardAmountCedis(reward)
  const costUnits = reward.enabled ? rewardCostUnits(reward, eligibility.eligible) : 0
  const short = reward.enabled && costUnits > balance
  const remaining = balance - costUnits

  function patch(partial) {
    onChange('reward', { ...reward, ...partial })
  }

  function selectType(type) {
    const meta = rewardTypes.find((item) => item.id === type)
    if (!meta?.available) return
    patch({
      type,
      amount: type === 'airtime' && reward.airtimePreset !== 'custom' ? String(airtimePresets.find((p) => p.id === reward.airtimePreset)?.amount ?? 5) : reward.amount || '10',
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-navy">Reward <span className="font-medium text-ink/45">(optional)</span></h2>
        <p className="mt-1 text-sm text-ink/55">
          Most campaigns are SMS only. Turn this on only if you want to give cash, airtime, or data with the message.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-[#F7FAFD] px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy">Add a reward to this campaign</p>
          <p className="mt-0.5 text-[13px] text-ink/55">
            {reward.enabled ? 'Configure what eligible recipients receive.' : 'Off by default — no reward will be attached.'}
          </p>
        </div>
        <Toggle id="reward-enabled" checked={Boolean(reward.enabled)} onChange={(enabled) => patch({ enabled, type: enabled ? reward.type || 'airtime' : reward.type })} />
      </div>

      {reward.enabled ? (
        <>
          <fieldset>
            <legend className="text-sm font-semibold text-navy">What would you like to give?</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Reward type">
              {rewardTypes.map((item) => {
                const Icon = typeIcons[item.id]
                const selected = reward.type === item.id
                const disabled = !item.available
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => selectType(item.id)}
                    className={`relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-[border-color,background-color,box-shadow] duration-200 ${focusClass} ${
                      disabled
                        ? 'cursor-not-allowed border-ink/10 bg-[#F7F8FA] opacity-60'
                        : selected
                          ? 'border-blue bg-[#F3F8FE] shadow-[0_0_0_1px_rgba(20,115,230,0.35)]'
                          : 'border-ink/12 bg-white hover:border-blue/40 hover:bg-[#F7FAFD]'
                    }`}
                  >
                    {selected ? (
                      <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-blue text-white" aria-hidden="true">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                    <span
                      className={`flex size-9 items-center justify-center rounded-lg ${
                        selected ? 'bg-blue text-white' : 'bg-[#EEF2F7] text-navy'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="mt-2.5 text-sm font-bold text-navy">{item.label}</span>
                    <span className="mt-1 text-[12px] leading-4 text-ink/55">{disabled ? 'Temporarily unavailable' : item.description}</span>
                    {!disabled ? <span className="mt-2 text-[11px] font-medium text-ink/40">{item.example}</span> : null}
                  </button>
                )
              })}
            </div>
            <FieldError id="reward-type-error">{errors.rewardType}</FieldError>
          </fieldset>

          {reward.type === 'cash' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reward-amount" className={labelClass}>
                  Reward amount per recipient
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ink/45">
                    {rewardCurrencyLabel}
                  </span>
                  <input
                    id="reward-amount"
                    inputMode="decimal"
                    value={reward.amount}
                    onChange={(event) => patch({ amount: event.target.value })}
                    className={`${field} h-11 pl-12`}
                    aria-invalid={Boolean(errors.rewardAmount)}
                    aria-describedby={errors.rewardAmount ? 'reward-amount-error' : undefined}
                    placeholder="10.00"
                  />
                </div>
                <FieldError id="reward-amount-error">{errors.rewardAmount}</FieldError>
              </div>
              <div>
                <label htmlFor="reward-disburse" className={labelClass}>
                  Disbursement method
                </label>
                <select
                  id="reward-disburse"
                  value={reward.disbursementMethod}
                  onChange={(event) => patch({ disbursementMethod: event.target.value })}
                  className={`${field} h-11`}
                >
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
            </div>
          ) : null}

          {reward.type === 'airtime' ? (
            <div>
              <p className={labelClass}>Airtime value per recipient</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Airtime presets">
                {airtimePresets.map((preset) => {
                  const selected = reward.airtimePreset === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        patch({
                          airtimePreset: preset.id,
                          amount: preset.amount != null ? String(preset.amount) : reward.amount,
                        })
                      }
                      className={`h-10 rounded-lg border px-3 text-sm font-semibold transition-colors ${focusClass} ${
                        selected ? 'border-blue bg-[#F3F8FE] text-blue' : 'border-ink/12 text-navy hover:bg-canvas'
                      }`}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
              {reward.airtimePreset === 'custom' ? (
                <div className="relative mt-3 max-w-xs">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ink/45">
                    {rewardCurrencyLabel}
                  </span>
                  <input
                    id="reward-airtime-custom"
                    inputMode="decimal"
                    value={reward.amount}
                    onChange={(event) => patch({ amount: event.target.value })}
                    className={`${field} h-11 pl-12`}
                    aria-invalid={Boolean(errors.rewardAmount)}
                    placeholder="5.00"
                  />
                </div>
              ) : null}
              <FieldError id="reward-amount-error">{errors.rewardAmount}</FieldError>
            </div>
          ) : null}

          {reward.type === 'data' ? (
            <div className="max-w-sm">
              <label htmlFor="reward-bundle" className={labelClass}>
                Data bundle
              </label>
              <select
                id="reward-bundle"
                value={reward.bundleId}
                onChange={(event) => patch({ bundleId: event.target.value })}
                className={`${field} h-11`}
                aria-invalid={Boolean(errors.rewardBundle)}
              >
                {dataBundles.map((bundle) => (
                  <option key={bundle.id} value={bundle.id}>
                    {bundle.label} · {formatRewardMoney(bundle.price)}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[12px] text-ink/45">Network is detected from each recipient&apos;s phone number when possible.</p>
              <FieldError id="reward-bundle-error">{errors.rewardBundle}</FieldError>
            </div>
          ) : null}

          <div className="rounded-xl border border-ink/10 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-navy">Eligibility</p>
                <p className="mt-1 text-[13px] text-ink/55">
                  {formatCount(eligibility.smsRecipients)} people will receive the SMS.{' '}
                  {formatCount(eligibility.eligible)} are eligible to receive the reward.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReasons((open) => !open)}
                className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue ${focusClass}`}
              >
                <Info className="size-3.5" aria-hidden="true" />
                {showReasons ? 'Hide reasons' : 'Why some are ineligible'}
              </button>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-[#F7FAFD] px-3 py-2.5">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/45">SMS recipients</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-navy">{formatCount(eligibility.smsRecipients)}</dd>
              </div>
              <div className="rounded-lg bg-[#F3F8FE] px-3 py-2.5">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/45">Eligible for reward</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-blue">{formatCount(eligibility.eligible)}</dd>
              </div>
              <div className="rounded-lg bg-[#FFF8F0] px-3 py-2.5">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/45">Not eligible</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-[#B45F06]">{formatCount(eligibility.notEligible)}</dd>
              </div>
            </dl>
            {showReasons ? (
              <ul className="mt-3 space-y-1.5 border-t border-ink/8 pt-3 text-[13px] text-ink/60">
                {eligibility.reasons.map((reason) => (
                  <li key={reason.id} className="flex justify-between gap-3">
                    <span>{reason.label}</span>
                    <span className="tabular-nums font-medium text-navy">{formatCount(reason.count)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 text-[12px] leading-5 text-ink/50">
              SMS is sent to all recipients. The reward is only disbursed to eligible contacts.
            </p>
          </div>

          <div className="rounded-xl border border-[#D8E7FA] bg-[#F7FAFD] p-4">
            <p className="text-sm font-semibold text-navy">Reward budget</p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 sm:block">
                <dt className="text-ink/55">Reward per recipient</dt>
                <dd className="font-semibold tabular-nums text-navy sm:mt-0.5">{amount > 0 ? formatRewardMoney(amount) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3 sm:block">
                <dt className="text-ink/55">Eligible recipients</dt>
                <dd className="font-semibold tabular-nums text-navy sm:mt-0.5">{formatCount(eligibility.eligible)}</dd>
              </div>
              <div className="flex justify-between gap-3 sm:col-span-2 sm:mt-1 sm:block sm:rounded-lg sm:bg-white sm:px-3 sm:py-2.5">
                <dt className="text-ink/55">Estimated reward total</dt>
                <dd className="text-lg font-bold tabular-nums text-navy sm:mt-0.5">{formatUnits(costUnits)}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-ink/10 pt-3">
              <dl className="grid gap-1.5 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/55">Available reward balance</dt>
                  <dd className="font-semibold tabular-nums text-navy">{formatUnits(balance)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/55">Estimated reward cost</dt>
                  <dd className="font-semibold tabular-nums text-navy">{formatUnits(costUnits)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/55">Remaining balance</dt>
                  <dd className={`font-semibold tabular-nums ${remaining < 0 ? 'text-[#C21F2D]' : 'text-green'}`}>
                    {formatUnits(remaining)}
                  </dd>
                </div>
              </dl>
            </div>

            {short ? (
              <div className="mt-3 rounded-lg border border-[#F5C6CB] bg-[#FDECEE] px-3 py-2.5 text-sm text-[#9F1C26]">
                <p className="font-semibold">Your available balance is not enough to fund this campaign.</p>
                <p className="mt-1 text-[13px]">Add funds, reduce the reward amount, or change the audience.</p>
                {onAddFunds ? (
                  <button type="button" onClick={onAddFunds} className={`mt-2 text-[13px] font-bold text-[#9F1C26] underline ${focusClass}`}>
                    Add funds
                  </button>
                ) : null}
              </div>
            ) : null}
            <FieldError id="reward-balance-error">{errors.rewardBalance}</FieldError>
          </div>

          {values.type === 'occasion' && values.repeatYearly ? (
            <div className="rounded-xl border border-[#FFE0A8] bg-[#FFF8EB] px-4 py-3 text-sm text-[#8A4B08]">
              <p className="font-semibold">Recurring reward</p>
              <p className="mt-1 text-[13px] leading-5">
                This campaign will send {amount > 0 ? formatRewardMoney(amount) : 'the configured reward'}{' '}
                {reward.type === 'airtime' ? 'airtime ' : reward.type === 'data' ? 'data ' : ''}
                each year to every eligible customer when the occasion fires. Actual costs may vary based on eligible recipients at send time.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
