import { AlertCircle, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { MAX_FILE_BYTES, MAX_ROWS, formatBytes } from '../rules'
import { card, focusClass } from '../ui'

// Click, press Enter or Space, or drop a file on it. The real <input type="file"> lives in the form
// above this component; this is just a big, friendly way to reach it.
export function FileDropzone({ error, onBrowse, onDropFile }) {
  const [dragging, setDragging] = useState(false)

  function onKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onBrowse()
    }
  }

  return (
    <section aria-labelledby="dropzone-heading" className={`${card} flex flex-col p-5`}>
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E4ECFA] text-xs font-bold text-navy">
          2
        </span>
        <div className="min-w-0">
          <h2 id="dropzone-heading" className="text-base font-bold text-navy">
            Upload your file
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-ink/60">
            We check every row for mistakes first. Nothing is added until you say so.
          </p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-describedby="dropzone-hint"
        onClick={onBrowse}
        onKeyDown={onKeyDown}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const file = event.dataTransfer.files?.[0]
          if (file) onDropFile(file)
        }}
        className={`mt-4 flex min-h-64 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${focusClass} ${
          dragging ? 'border-blue bg-blue/[0.06]' : 'border-[#BFD5F2] bg-[#F7FAFF] hover:border-blue/60 hover:bg-[#F0F6FE]'
        }`}
      >
        <span
          className={`flex size-14 items-center justify-center rounded-2xl transition-colors ${
            dragging ? 'bg-blue text-white' : 'bg-[#E3EFFD] text-blue'
          }`}
        >
          <UploadCloud size={28} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-navy">
          {dragging ? 'Drop it here' : 'Drag your Excel file here'}
        </p>
        <p className="mt-1 text-[13px] text-ink/60">
          or <span className="font-semibold text-blue underline underline-offset-2">browse your computer</span>
        </p>
        <p id="dropzone-hint" className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink/50">
          <FileSpreadsheet size={14} aria-hidden="true" />
          Excel .xlsx only · up to {formatBytes(MAX_FILE_BYTES)} · {MAX_ROWS.toLocaleString('en-US')} contacts
        </p>
      </div>

      {error ? (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-[#FFEDEE] px-3 py-2.5 text-[13px] leading-5 text-[#9F1420]">
          <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </section>
  )
}
