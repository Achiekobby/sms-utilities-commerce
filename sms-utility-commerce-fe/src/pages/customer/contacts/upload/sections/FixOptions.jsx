import { AlertTriangle, Eraser, FilePen, Loader2 } from 'lucide-react'
import { formatCount } from '../../../dashboard/format'
import { card, primaryButton, secondaryButton } from '../ui'

// Two ways forward, written so nobody has to guess what each one does to their file.
export function FixOptions({ failed, valid, cleaning, onReupload, onClean }) {
  const noun = (count) => (count === 1 ? 'row' : 'rows')

  return (
    <section aria-labelledby="fix-heading" className={`${card} p-4 sm:p-5`}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFEBCB] text-[#B45F06]">
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 id="fix-heading" className="text-base font-bold text-navy">
            {formatCount(failed)} {noun(failed)} can&apos;t be imported yet
          </h2>
          <p className="mt-0.5 text-[13px] leading-5 text-ink/60">
            {valid > 0
              ? `The other ${formatCount(valid)} ${noun(valid)} look good. Choose how you'd like to carry on.`
              : 'None of the rows passed the check, so please correct the file and upload it again.'}
          </p>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${valid > 0 ? 'md:grid-cols-2' : ''}`}>
        <div className="flex flex-col rounded-xl border border-[#E1EAF6] p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#E3EFFD] text-blue">
              <FilePen size={17} aria-hidden="true" />
            </span>
            <h3 className="text-sm font-bold text-navy">Fix it yourself</h3>
          </div>
          <p className="mt-2 flex-1 text-[13px] leading-5 text-ink/65">
            Correct the rows listed below in Excel (use the row numbers), save the file, then upload it again. Best
            when every contact matters.
          </p>
          <button type="button" onClick={onReupload} className={`${secondaryButton} mt-4`}>
            Upload corrected file
          </button>
        </div>

        {valid > 0 ? (
          <div className="flex flex-col rounded-xl border border-blue/30 bg-[#F5F9FF] p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue text-white">
                <Eraser size={17} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-bold text-navy">Remove the problem rows</h3>
            </div>
            <p className="mt-2 flex-1 text-[13px] leading-5 text-ink/65">
              We&apos;ll make a clean copy with only the {formatCount(valid)} good {noun(valid)} and use that one for
              the import. Your original file isn&apos;t changed.
            </p>
            <button type="button" onClick={onClean} disabled={cleaning} className={`${primaryButton} mt-4`}>
              {cleaning ? <Loader2 size={17} aria-hidden="true" className="animate-spin" /> : null}
              {cleaning ? 'Cleaning your file…' : `Remove ${formatCount(failed)} ${noun(failed)} and continue`}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
