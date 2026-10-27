import { Asterisk, CheckCircle2, Circle, Download, Loader2 } from 'lucide-react'
import { MAX_ROWS, columns } from '../rules'
import { card, secondaryButton } from '../ui'

export function TemplateCard({ downloaded, busy, onDownload }) {
  return (
    <section aria-labelledby="template-heading" className={`${card} flex flex-col p-5`}>
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E4ECFA] text-xs font-bold text-navy">
          1
        </span>
        <div className="min-w-0">
          <h2 id="template-heading" className="text-base font-bold text-navy">
            Start with our template
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-ink/60">
            An Excel file with the exact columns we need. Fill it in, then upload it on the right. Already have a
            list? Just make sure it has the same column names.
          </p>
        </div>
      </div>

      <button type="button" onClick={onDownload} disabled={busy} className={`${secondaryButton} mt-4 w-full`}>
        {busy ? (
          <Loader2 size={17} aria-hidden="true" className="animate-spin text-blue" />
        ) : downloaded ? (
          <CheckCircle2 size={17} aria-hidden="true" className="text-green" />
        ) : (
          <Download size={17} strokeWidth={2} aria-hidden="true" className="text-blue" />
        )}
        {downloaded ? 'Download again' : 'Download template (.xlsx)'}
      </button>

      <h3 className="mt-5 text-xs font-semibold tracking-wide text-ink/55 uppercase">What goes in each column</h3>
      <ul className="mt-2 divide-y divide-ink/[0.07]">
        {columns.map((column) => (
          <li key={column.key} className="py-2.5 first:pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-navy">{column.label}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-semibold ${
                  column.required ? 'bg-[#FFE4E6] text-[#B8141F]' : 'bg-[#E4ECFA] text-ink/60'
                }`}
              >
                {column.required ? (
                  <Asterisk size={11} strokeWidth={2.4} aria-hidden="true" />
                ) : (
                  <Circle size={11} strokeWidth={2.2} aria-hidden="true" />
                )}
                {column.required ? 'Required' : 'Optional'}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-5 text-ink/60">{column.help}</p>
            <p className="text-xs text-ink/45">
              Example: <span className="font-medium text-ink/70">{column.example}</span>
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-4 text-xs leading-5 text-ink/50">
        Up to {MAX_ROWS.toLocaleString('en-US')} contacts per file. Blank rows are skipped automatically.
      </p>
    </section>
  )
}
