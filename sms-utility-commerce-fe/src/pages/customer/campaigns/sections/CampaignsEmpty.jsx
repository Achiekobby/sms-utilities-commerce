import { FileText, Plus, Radio } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function CampaignsEmpty() {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-ink/15 bg-white px-5 py-14 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#E7F1FC] text-blue">
        <Radio size={22} strokeWidth={2.1} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-navy">No campaigns yet</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-ink/60">
        Create your first SMS campaign to start reaching your customers with occasions and promotions.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <Link
          to={paths.newCampaign}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] ${focusClass}`}
        >
          <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
          Create campaign
        </Link>
        <Link
          to={paths.templates}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:border-blue/40 hover:bg-canvas ${focusClass}`}
        >
          <FileText size={16} strokeWidth={2.2} aria-hidden="true" />
          Browse templates
        </Link>
      </div>
    </div>
  )
}
