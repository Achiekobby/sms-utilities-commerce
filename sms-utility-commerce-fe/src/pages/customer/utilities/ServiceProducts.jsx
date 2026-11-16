import { useState } from 'react'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { quotePayload, serviceOffer } from '../../../features/utilities/utilityModel'
import { QuoteAction } from './QuoteAction'
import { AirtimePanel } from './AirtimePanel'
import { TelcoLogo } from './TelcoLogo'
import { TvPanel } from './TvPanel'
import { CheckerPanel } from './CheckerPanel'
import { EcgPanel } from './EcgPanel'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function money(amount, currency) {
  return formatWalletAmount(amount, currency)
}

function bundleFace(size) {
  const match = String(size ?? '').trim().match(/^(\d+(?:\.\d+)?)\s*([A-Za-z]+)$/)
  if (!match) return { value: size || 'Bundle', unit: '' }
  return { value: match[1], unit: match[2].toUpperCase() }
}

function PlanGrid({ plans, currency, tone, selectedId, onSelect }) {
  if (!plans.length) return <p className="text-sm text-ink/55">No bundles are listed for this network.</p>

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {plans.map((plan) => {
        const picked = plan.id === selectedId
        const face = bundleFace(plan.size)
        const code = currency || 'GHS'
        return (
          <li key={plan.id}>
            <button
              type="button"
              aria-pressed={picked}
              disabled={!plan.available}
              onClick={() => onSelect(plan.id)}
              className={`relative flex h-full min-h-[8.25rem] w-full cursor-pointer flex-col overflow-hidden rounded-2xl border px-3.5 pt-4 pb-3.5 text-left shadow-[0_1px_2px_rgba(16,33,61,0.04)] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusClass} ${
                picked ? '' : 'border-[#E3ECF7] bg-white hover:border-(--telco)'
              }`}
              style={{
                '--telco': tone.color,
                ...(picked
                  ? { borderColor: tone.color, backgroundColor: tone.tint, boxShadow: `0 0 0 1px ${tone.color}` }
                  : null),
              }}
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: tone.color, opacity: picked ? 1 : 0.45 }}
                aria-hidden="true"
              />
              <span className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className={`font-bold tracking-tight text-navy tabular-nums ${face.unit ? 'text-[1.65rem] leading-none' : 'text-[15px] leading-5'}`}>
                    {face.value}
                  </span>
                  {face.unit ? (
                    <span className="ml-1 text-[11px] font-semibold tracking-wide text-ink/40">{face.unit}</span>
                  ) : null}
                </span>
                <span
                  className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border"
                  style={
                    picked
                      ? { borderColor: tone.color, backgroundColor: tone.color }
                      : { borderColor: '#D5E0EE', backgroundColor: '#fff' }
                  }
                  aria-hidden="true"
                >
                  {picked ? <span className="size-1.5 rounded-full bg-white" /> : null}
                </span>
              </span>
              <span className="mt-auto flex items-baseline gap-1.5 pt-4">
                <span className="text-[10px] font-semibold tracking-wide text-ink/40">{code}</span>
                <span className="text-base font-bold text-navy tabular-nums">{money(plan.price, '')}</span>
              </span>
              <span
                className="mt-1 text-[11px] font-semibold tracking-wide uppercase"
                style={{ color: picked ? tone.ink : 'rgba(16,33,61,0.4)' }}
              >
                {picked ? 'Selected' : plan.available ? 'Choose' : 'Unavailable'}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function PlanOffer({ offer }) {
  const [networkId, setNetworkId] = useState(offer.groups[0]?.id ?? '')
  const [planId, setPlanId] = useState('')
  const active = offer.groups.find((group) => group.id === networkId) ?? offer.groups[0]
  const plan = (active?.plans ?? []).find((item) => item.id === planId) ?? null

  if (!offer.groups.length) return <p className="text-sm text-ink/55">No bundles are available right now.</p>

  function chooseNetwork(id) {
    setNetworkId(id)
    setPlanId('')
  }

  return (
    <div className="space-y-4">
      {offer.groups.length > 1 ? (
        <div role="tablist" aria-label="Networks" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {offer.groups.map((group) => {
            const pressed = group.id === active?.id
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={pressed}
                onClick={() => chooseNetwork(group.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${focusClass} ${
                  pressed ? '' : 'border-[#E3ECF7] bg-white hover:border-ink/15'
                }`}
                style={
                  pressed
                    ? { borderColor: group.color, backgroundColor: group.tint, boxShadow: `0 0 0 1px ${group.color}` }
                    : undefined
                }
              >
                <TelcoLogo image={group.image} label={group.label} color={group.color} fit={group.fit} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-navy">{group.label}</span>
                  <span
                    className="mt-0.5 block text-[11px] font-semibold tracking-wide uppercase"
                    style={{ color: pressed ? group.ink : 'rgba(16,33,61,0.4)' }}
                  >
                    {pressed ? 'Selected' : `${group.plans.length} bundles`}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <TelcoLogo
            image={offer.groups[0].image}
            label={offer.groups[0].label}
            color={offer.groups[0].color}
            fit={offer.groups[0].fit}
          />
          <p className="text-sm font-semibold text-navy">{offer.groups[0].label}</p>
        </div>
      )}
      <PlanGrid
        plans={active?.plans ?? []}
        currency={offer.currency}
        tone={active}
        selectedId={planId}
        onSelect={setPlanId}
      />
      <QuoteAction
        direct
        canSubmit={Boolean(plan?.available)}
        preview={
          plan
            ? {
                title: plan.size || 'Data bundle',
                network: active?.label,
                unitAmount: plan.price,
                currency: offer.currency,
                verifiedContacts: offer.service === 'mashup' || String(active?.id ?? '').toLowerCase() === 'yello',
              }
            : null
        }
        payload={quotePayload({ service: offer.service, packageId: plan?.id })}
        signature={`${offer.service}:${plan?.id ?? ''}`}
        image={active?.image}
        imageAlt={active?.label}
      />
    </div>
  )
}

export function ServiceProducts({ catalog, serviceKey }) {
  const offer = serviceOffer(catalog, serviceKey)

  if (offer.kind === 'plans') return <PlanOffer offer={offer} />
  if (offer.kind === 'networks') return <AirtimePanel items={offer.items} currency={offer.currency} />
  if (offer.kind === 'bills') return <TvPanel items={offer.items} currency={offer.currency} />
  if (offer.kind === 'checkers') {
    return <CheckerPanel items={offer.items} currency={offer.currency} maxQuantity={offer.maxQuantity} />
  }
  if (offer.kind === 'amount') return <EcgPanel offer={offer} />

  return <p className="text-sm text-ink/55">Nothing is listed for this service yet.</p>
}
