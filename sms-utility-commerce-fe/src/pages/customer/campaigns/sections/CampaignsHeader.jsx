import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function CampaignsHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">SMS Campaigns</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          Reach your customers with personalized, scheduled, and automated SMS campaigns.
        </p>
      </div>
      <Link
        to={paths.newCampaign}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`}
      >
        <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
        Create campaign
      </Link>
    </header>
  )
}
