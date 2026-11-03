import { AlertCircle, CheckCircle2, Clock3, Loader2 } from 'lucide-react'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { formatCount } from '../../dashboard/format'
import { formatBytes } from '../upload/rules'

const statusLook = {
  queued: { label: 'Queued', icon: Clock3, pill: 'bg-[#FFEBCB] text-[#B45F06]' },
  processing: { label: 'Adding contacts', icon: Loader2, pill: 'bg-[#E3EFFD] text-[#0B63F6]' },
  completed: { label: 'Completed', icon: CheckCircle2, pill: 'bg-[#DDF3E6] text-[#0E7A38]' },
  failed: { label: 'Failed', icon: AlertCircle, pill: 'bg-[#FDECEE] text-[#C21F2D]' },
}

function Count({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-ink/50">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-navy tabular-nums">{formatCount(value)}</p>
    </div>
  )
}

export function UploadCard({ item, featured = false }) {
  const look = statusLook[item.status] ?? { label: item.status, icon: Clock3, pill: 'bg-canvas text-navy' }
  const Icon = look.icon
  const width = item.running ? Math.max(item.progress, 8) : item.progress

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] sm:p-5 ${
        featured ? 'border-blue/40 ring-2 ring-blue/15' : 'border-[#D8E7FA]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-navy sm:text-base">{item.fileName}</h2>
          <p className="mt-0.5 text-xs text-ink/55">
            {item.fileSize ? formatBytes(item.fileSize) : 'Excel file'}
            {item.createdAt ? ` · ${formatStamp(item.createdAt)}` : ''}
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${look.pill}`}>
          <Icon size={13} strokeWidth={2.4} aria-hidden="true" className={item.running ? 'animate-spin motion-reduce:animate-none' : ''} />
          {look.label}
        </span>
      </div>

      <div className="mt-4" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress} aria-label={`${item.fileName} progress`}>
        <div className="flex items-center justify-between text-[11px] font-medium text-ink/55">
          <span>{item.running ? 'Working through the file' : item.status === 'failed' ? 'Stopped' : 'Finished'}</span>
          <span className="tabular-nums">{item.progress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
          <div
            className={`relative h-full rounded-full transition-[width] duration-500 ${item.status === 'failed' ? 'bg-[#C21F2D]' : 'bg-blue'}`}
            style={{ width: `${width}%` }}
          >
            {item.running ? <span className="upload-slide absolute inset-y-0 w-1/3 bg-white/50" /> : null}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Count label="In the file" value={item.total} />
        <Count label="Added" value={item.inserted} />
        <Count label="Skipped" value={item.skipped} />
        <Count label="Failed" value={item.failed} />
      </dl>

      {item.message ? <p className="mt-3 text-[13px] leading-5 text-ink/70">{item.message}</p> : null}
      {item.chunksExpected > 0 ? (
        <p className="mt-2 text-[11px] text-ink/45 tabular-nums">
          {item.chunksDone} of {item.chunksExpected} parts done
        </p>
      ) : null}
    </article>
  )
}
