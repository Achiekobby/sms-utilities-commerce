import { FileSpreadsheet } from 'lucide-react'
import { formatCount } from '../../../dashboard/format'
import { formatBytes } from '../rules'
import { card, secondaryButton } from '../ui'

// Shown while the worker reads and checks the file. Reading is a single step with no measurable
// progress, so the bar is indeterminate until row checking starts and then fills as rows are done.
export function CheckProgress({ file, phase, stage, percent, done, total, onCancel }) {
  const checking = phase === 'checking'

  return (
    <section aria-label="Checking your file" className={`${card} mx-auto max-w-2xl p-6 sm:p-8`}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E6] text-green">
          <FileSpreadsheet size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy">{file.name}</p>
          <p className="text-xs text-ink/55">{formatBytes(file.size)}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-semibold text-navy">{stage}</p>
          {checking ? <p className="text-sm font-semibold text-blue tabular-nums">{percent}%</p> : null}
        </div>

        <div
          role="progressbar"
          aria-label="Checking progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={checking ? percent : undefined}
          className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-[#E4ECFA]"
        >
          {checking ? (
            <span
              className="block h-full rounded-full bg-blue transition-[width] duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          ) : (
            <span className="absolute inset-y-0 w-1/3 animate-[slide_1.2s_ease-in-out_infinite] rounded-full bg-blue motion-reduce:animate-none" />
          )}
        </div>

        <p className="mt-3 text-[13px] leading-5 text-ink/60" role="status">
          {checking
            ? `Checked ${formatCount(done)} of ${formatCount(total)} rows.`
            : 'Opening the file. Large files can take a few seconds.'}{' '}
          This happens in the background, so the page stays responsive.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </section>
  )
}
