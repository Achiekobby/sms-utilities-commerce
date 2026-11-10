import { CheckCircle2, Radio, Send, XCircle } from 'lucide-react'
import { formatCount } from '../../dashboard/format'
import { campaignMetrics } from '../model'

const cards = [
  { key: 'sent', label: 'Total sent', icon: Send, tint: '#E7F1FC', color: '#0B63F6' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, tint: '#E5F6EC', color: '#008859' },
  { key: 'failed', label: 'Failed', icon: XCircle, tint: '#FDECEE', color: '#C21F2D' },
  { key: 'active', label: 'Active campaigns', icon: Radio, tint: '#FFF8EE', color: '#B45F06' },
]

export function CampaignMetrics({ campaigns }) {
  const metrics = campaignMetrics(campaigns)

  return (
    <section aria-label="Campaign summary" className="mt-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          const value = metrics[card.key]
          return (
            <div
              key={card.key}
              className="rounded-xl border border-ink/[0.06] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_10px_24px_-18px_rgba(11,31,91,0.35)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink/55">{card.label}</p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-navy tabular-nums sm:text-2xl">
                    {formatCount(value)}
                  </p>
                  {card.key === 'delivered' && metrics.rate ? (
                    <p className="mt-1 text-[12px] font-medium text-green tabular-nums">{metrics.rate} delivery rate</p>
                  ) : null}
                </div>
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: card.tint, color: card.color }}
                >
                  <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
