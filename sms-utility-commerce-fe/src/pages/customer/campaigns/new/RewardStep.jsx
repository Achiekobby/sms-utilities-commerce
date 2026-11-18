import { Gift, Phone, Signal, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import { formatRewardPrice, rewardTypeLabel } from '../../../../features/rewards/rewardRecord'
import { telcoMark } from '../../../../features/utilities/utilityModel'
import { paths } from '../../../../routes/paths'
import { useGetRewardsQuery } from '../../../../services/api/rewards/rewardsApi'
import { formatCount } from '../../dashboard/format'
import { formatUnits } from '../../wallet/money'
import { emptyReward, formatRewardMoney, rewardAmountCedis, rewardCostUnits } from '../reward'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const errorColor = '#E0232E'

const typeIcons = {
  money: Wallet,
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

export function RewardStep({ values, errors, onChange, smsRecipients }) {
  const reward = values.reward
  const rewards = useGetRewardsQuery({ page: 1, perPage: 50, status: 'instock' })
  const rows = rewards.data?.rows ?? []
  const selected = rows.find((item) => item.id === String(reward.rewardId || '')) ?? null
  const amount = selected ? Number(selected.amount) || 0 : rewardAmountCedis(reward)
  const costUnits = reward.enabled
    ? rewardCostUnits(
        {
          ...reward,
          enabled: true,
          type: selected?.type === 'money' ? 'cash' : selected?.type || reward.type,
          amount: String(amount || ''),
          airtimePreset: 'custom',
        },
        smsRecipients,
      )
    : 0

  function patch(partial) {
    onChange('reward', { ...reward, ...partial })
  }

  function selectReward(item) {
    patch({
      enabled: true,
      rewardId: item.id,
      type: item.type === 'money' ? 'cash' : item.type,
      amount: item.amount == null ? '' : String(item.amount),
      network: item.network || '',
      bundleId: item.packageId || item.size || '',
      bundleLabel: item.size || item.name,
      airtimePreset: item.type === 'airtime' ? String(item.amount) : reward.airtimePreset,
      disbursementMethod: 'mobile_money',
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-navy">
          Reward <span className="font-medium text-ink/45">(optional)</span>
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          Attach one of your saved rewards. Campaigns store the reward ID so disbursement uses the same catalog item.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-[#F7FAFD] px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy">Add a reward to this campaign</p>
          <p className="mt-0.5 text-[13px] text-ink/55">
            {reward.enabled ? 'Choose a reward from your catalog.' : 'Off by default — no reward will be attached.'}
          </p>
        </div>
        <Toggle
          id="reward-enabled"
          checked={Boolean(reward.enabled)}
          onChange={(enabled) => patch(enabled ? { ...reward, enabled: true } : emptyReward())}
        />
      </div>

      {reward.enabled ? (
        <>
          {rewards.isLoading ? (
            <div role="status" className="space-y-2">
              <span className="sr-only">Loading rewards</span>
              {Array.from({ length: 3 }, (_, index) => (
                <span key={index} className="skeleton block h-16 rounded-xl" />
              ))}
            </div>
          ) : rewards.isError ? (
            <div role="alert" className="rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 text-sm text-[#9F1C26]">
              Rewards could not be loaded. Try again from the Rewards page.
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/15 bg-white px-4 py-6 text-center">
              <Gift className="mx-auto text-ink/30" size={24} strokeWidth={1.8} aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-navy">No rewards available</p>
              <p className="mt-1 text-sm text-ink/55">Create a reward first, then come back to attach it.</p>
              <Link
                to={paths.rewards}
                className={`mt-3 inline-flex h-9 items-center rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
              >
                Open rewards
              </Link>
            </div>
          ) : (
            <fieldset>
              <legend className="text-sm font-semibold text-navy">Choose a reward</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Campaign reward">
                {rows.map((item) => {
                  const Icon = typeIcons[item.type] ?? Gift
                  const mark = telcoMark(item.network)
                  const selectedItem = String(reward.rewardId) === item.id
                  const wide = mark.fit === 'contain'
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedItem}
                      onClick={() => selectReward(item)}
                      className={`relative rounded-xl border p-3.5 text-left transition-colors ${focusClass} ${
                        selectedItem
                          ? 'border-blue bg-[#F3F8FE] shadow-[0_0_0_1px_rgba(20,115,230,0.35)]'
                          : 'border-ink/12 bg-white hover:border-blue/40'
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        {mark.image ? (
                          <span
                            className={`flex h-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ${wide ? 'w-14' : 'w-9'}`}
                            style={wide ? { backgroundColor: mark.color } : undefined}
                          >
                            <img src={mark.image} alt="" className={wide ? 'h-auto w-full' : 'size-full object-cover'} />
                          </span>
                        ) : (
                          <span className={`flex size-9 items-center justify-center rounded-lg ${selectedItem ? 'bg-blue text-white' : 'bg-[#EEF2F7] text-navy'}`}>
                            <Icon size={16} aria-hidden="true" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-navy">{item.name}</span>
                          <span className="mt-1 block text-[12px] text-ink/55">
                            {rewardTypeLabel(item.type)}
                            {item.network ? ` · ${item.network}` : ''}
                            {' · '}
                            {item.type === 'data' && item.size ? item.size : formatRewardPrice(item.amount, item.currency)}
                          </span>
                          <span className="mt-1 block text-[11px] text-ink/40">ID {item.id}</span>
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
              <FieldError id="reward-type-error">{errors.rewardType || errors.rewardId}</FieldError>
            </fieldset>
          )}

          {selected || reward.rewardId ? (
            <div className="rounded-xl border border-ink/10 bg-white p-4">
              <p className="text-sm font-semibold text-navy">Reward estimate</p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-[#F7FAFD] px-3 py-2.5">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/45">Selected contacts</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-navy">{formatCount(smsRecipients)}</dd>
                </div>
                <div className="rounded-lg bg-[#F3F8FE] px-3 py-2.5">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/45">Each reward</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-blue">
                    {amount > 0 ? formatRewardMoney(amount) : '—'}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#E8F8EF] px-3 py-2.5">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/45">Estimated total</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-green">{formatUnits(costUnits)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[12px] leading-5 text-ink/50">
                The campaign stores reward ID {reward.rewardId || '—'}. Nothing is charged until the campaign is activated.
              </p>
            </div>
          ) : null}

          {values.type === 'occasion' && values.repeatYearly ? (
            <div className="rounded-xl border border-[#FFE0A8] bg-[#FFF8EB] px-4 py-3 text-sm text-[#8A4B08]">
              <p className="font-semibold">Recurring reward</p>
              <p className="mt-1 text-[13px] leading-5">
                This campaign will send the selected reward each year to eligible contacts when the occasion fires.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
