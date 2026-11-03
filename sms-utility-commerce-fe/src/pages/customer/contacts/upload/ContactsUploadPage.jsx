import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { apiErrorMessage } from '../../../../features/auth/client'
import { paths } from '../../../../routes/paths'
import { useUploadContactsMutation } from '../../../../services/api/contacts/contactRecordsApi'
import { useDocumentTitle } from '../../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../../dashboard/format'
import { useContactGroup } from '../useGroups'
import { MAX_FILE_BYTES, formatBytes } from './rules'
import { CheckProgress } from './sections/CheckProgress'
import { FileDropzone } from './sections/FileDropzone'
import { FixOptions } from './sections/FixOptions'
import { ProblemRows } from './sections/ProblemRows'
import { ReviewSummary } from './sections/ReviewSummary'
import { TemplateCard } from './sections/TemplateCard'
import { UploadStepper } from './sections/UploadStepper'
import { downloadTemplate } from './template'
import { card, primaryButton, secondaryButton, textButton } from './ui'
import { useSheetCheck } from './useSheetCheck'

const backLink = textButton

function validateFile(file) {
  const name = file.name.toLowerCase()

  if (!name.endsWith('.xlsx')) {
    if (name.endsWith('.xls')) {
      return 'That is an older Excel (.xls) file. Open it in Excel, choose File → Save As → “Excel Workbook (.xlsx)”, then upload the new copy.'
    }
    if (name.endsWith('.csv')) {
      return 'That is a .csv file. Open it in Excel and save it as “Excel Workbook (.xlsx)”, or start from our template.'
    }
    return 'Only Excel (.xlsx) files can be uploaded. Download the template if you are not sure how it should look.'
  }
  if (file.size === 0) return 'That file is empty. Please choose a file with your contacts in it.'
  if (file.size > MAX_FILE_BYTES) {
    return `That file is ${formatBytes(file.size)}, and the limit is ${formatBytes(MAX_FILE_BYTES)}. Try splitting it into smaller files.`
  }
  return ''
}

// Puts a File into the real <input type="file">, so the form always submits the file the page is showing,
// including the cleaned copy the page created itself.
function fillInput(input, file) {
  try {
    const transfer = new DataTransfer()
    transfer.items.add(file)
    input.files = transfer.files
  } catch {
    // Older browsers cannot set files programmatically. The page still holds the file in state.
  }
}

function saveFile(file) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  URL.revokeObjectURL(url)
}

function Banner({ tone, icon: Icon, title, children, action }) {
  const tones = {
    green: 'border-green/25 bg-[#EEF9F2] text-[#0E7A38]',
    red: 'border-[#F3B8BD] bg-[#FFF1F2] text-[#9F1420]',
    blue: 'border-blue/25 bg-[#F0F6FE] text-navy',
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${tones[tone]}`}>
      <Icon size={20} aria-hidden="true" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        {children ? <p className="mt-0.5 text-[13px] leading-5 text-ink/70">{children}</p> : null}
      </div>
      {action}
    </div>
  )
}

function FileBar({ file, cleaned, onChange }) {
  return (
    <div className={`${card} flex flex-wrap items-center gap-3 p-3.5 sm:px-5`}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E6] text-green">
        <FileSpreadsheet size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-navy">{file.name}</p>
        <p className="text-xs text-ink/55">
          {formatBytes(file.size)}
          {cleaned ? ' · clean copy made by us' : ''}
        </p>
      </div>
      <button type="button" onClick={onChange} className={secondaryButton}>
        <RefreshCw size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
        Choose a different file
      </button>
    </div>
  )
}

function FileProblem({ problem, onChoose, onTemplate }) {
  return (
    <section aria-labelledby="problem-heading" className={`${card} mx-auto max-w-2xl p-6 sm:p-8`}>
      <span className="flex size-12 items-center justify-center rounded-xl bg-[#FFE4E6] text-[#D7192A]">
        <AlertCircle size={24} aria-hidden="true" />
      </span>
      <h2 id="problem-heading" className="mt-4 text-lg font-bold text-navy">
        {problem.title}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-ink/65">{problem.detail}</p>

      {problem.found?.length ? (
        <div className="mt-4 rounded-lg bg-canvas p-3">
          <p className="text-xs font-semibold text-ink/55">Column names we found in your file</p>
          <p className="mt-1 text-[13px] text-navy">{problem.found.join(' · ')}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2.5">
        <button type="button" onClick={onChoose} className={primaryButton}>
          Choose another file
        </button>
        <button type="button" onClick={onTemplate} className={secondaryButton}>
          <Download size={16} strokeWidth={2} aria-hidden="true" className="text-blue" />
          Get the template
        </button>
      </div>
    </section>
  )
}

function ImportDone({ added, skipped, group, onAnother }) {
  const reduce = useReducedMotion()

  return (
    <section aria-labelledby="done-heading" className={`${card} mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center sm:px-10`}>
      <motion.span
        initial={reduce ? false : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex size-20 items-center justify-center rounded-full bg-[#DDF3E6]"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-green text-white shadow-[0_8px_20px_-8px_rgba(21,148,71,0.8)]">
          <Check size={30} strokeWidth={3} aria-hidden="true" />
        </span>
      </motion.span>

      <h2 id="done-heading" className="mt-6 text-xl font-bold tracking-tight text-navy">
        {formatCount(added)} {added === 1 ? 'contact' : 'contacts'} added
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink/65">
        They are now in <span className="font-semibold text-navy">{group.name}</span>
        {skipped ? `. ${formatCount(skipped)} ${skipped === 1 ? 'row was' : 'rows were'} left out.` : '.'}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <Link to={paths.contactGroup(group.id)} className={primaryButton}>
          View group
        </Link>
        <button type="button" onClick={onAnother} className={secondaryButton}>
          Upload another file
        </button>
      </div>
    </section>
  )
}

export function ContactsUploadPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { group, isLoading, isFetching, isError, error, refetch } = useContactGroup(groupId)
  const waiting = !group && !isError && (isLoading || isFetching)
  const [uploadContacts] = useUploadContactsMutation()
  const check = useSheetCheck()

  const formRef = useRef(null)
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [templateSaved, setTemplateSaved] = useState(false)
  const [templateBusy, setTemplateBusy] = useState(false)
  const [importState, setImportState] = useState({ status: 'idle', added: 0, error: '' })

  useDocumentTitle(group ? `Upload contacts · ${group.name}` : waiting ? 'Upload contacts' : 'Group not found')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [groupId])

  if (waiting) {
    return (
      <div role="status" aria-live="polite" className="mx-auto max-w-md py-16 text-center">
        <span className="skeleton mx-auto block h-6 w-40 rounded" />
        <span className="sr-only">Loading group</span>
      </div>
    )
  }

  if (!group && isError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold text-navy">Could not load this group</h1>
        <p className="mt-2 text-sm text-ink/60">{apiErrorMessage(error)}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          Try again
        </button>
      </div>
    )
  }

  if (group?.deletedAt) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold text-navy">{group.name} is archived</h1>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Restore the group before uploading contacts. Contacts already in it were not removed.
        </p>
        <Link to={`${paths.contacts}?view=archived`} className={`${backLink} mt-5`}>
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          Back to archived groups
        </Link>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold text-navy">Group not found</h1>
        <p className="mt-2 text-sm text-ink/60">This group may have been deleted, or the link is out of date.</p>
        <Link to={paths.contacts} className={`${backLink} mt-5`}>
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          Back to Contact Groups
        </Link>
      </div>
    )
  }

  const { phase, result, problem, cleaned, cleaning } = check
  const analysing = phase === 'reading' || phase === 'checking'
  const ready = phase === 'done' && Boolean(result) && result.valid > 0 && (result.failed === 0 || Boolean(cleaned))
  const importing = importState.status === 'importing'
  const imported = importState.status === 'done'

  let step = templateSaved ? 1 : 0
  if (analysing) step = 2
  else if (phase === 'done' && result) step = ready ? 3 : 2
  else if (phase === 'done' || phase === 'failed') step = 1
  if (importing) step = 3
  if (imported) step = 4

  let announcement = ''
  if (analysing) announcement = 'Checking your file.'
  else if (phase === 'done' && result) {
    announcement = `Check complete. ${formatCount(result.valid)} rows are ready and ${formatCount(result.failed)} need attention.`
  } else if (phase === 'done' && problem) announcement = problem.title

  function browse() {
    if (!inputRef.current) return
    inputRef.current.value = ''
    inputRef.current.click()
  }

  function accept(next, fromInput = false) {
    const reason = validateFile(next)
    if (reason) {
      setFileError(reason)
      if (fromInput && inputRef.current) inputRef.current.value = ''
      return
    }

    setFileError('')
    if (!fromInput) fillInput(inputRef.current, next)
    setFile(next)
    setImportState({ status: 'idle', added: 0, error: '' })
    check.analyze(next)
  }

  function startOver() {
    check.reset()
    setFile(null)
    setFileError('')
    setImportState({ status: 'idle', added: 0, error: '' })
    if (inputRef.current) inputRef.current.value = ''
  }

  async function getTemplate() {
    setTemplateBusy(true)
    try {
      await downloadTemplate()
      setTemplateSaved(true)
    } finally {
      setTemplateBusy(false)
    }
  }

  async function removeProblemRows() {
    try {
      const copy = await check.clean()
      fillInput(inputRef.current, copy)
      setFile(copy)
    } catch {
      // The check was cancelled or restarted, so there is nothing to keep.
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!ready || importing) return

    setImportState({ status: 'importing', added: 0, error: '' })
    try {
      const uploaded = await uploadContacts({ groupId: group.id, file }).unwrap()
      navigate(paths.contactUploads(group.id), {
        state: { importId: uploaded.item?.id ?? '', notice: uploaded.message },
      })
    } catch (uploadError) {
      setImportState({
        status: 'error',
        added: 0,
        error: apiErrorMessage(uploadError),
      })
    }
  }

  const dropzoneError = fileError || (phase === 'failed' ? check.error : '')

  return (
    <div className="w-full min-w-0">
      <Link to={paths.contactGroup(group.id)} className={backLink}>
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        Back to {group.name}
      </Link>

      <header className="mt-3">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Upload contacts</h1>
        <p className="mt-1.5 text-sm leading-6 text-ink/60 sm:text-[15px]">
          Add people to <span className="font-semibold text-navy">{group.name}</span> from an Excel file. We&apos;ll
          check it for mistakes first.
        </p>
      </header>

      <div className={`${card} mt-5 px-4 py-4 sm:px-6`}>
        <UploadStepper current={step} />
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <form ref={formRef} onSubmit={submit} noValidate className="mt-5 space-y-4">
        <input
          ref={inputRef}
          type="file"
          name="file"
          hidden
          tabIndex={-1}
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            const picked = event.target.files?.[0]
            if (picked) accept(picked, true)
          }}
        />
        <input type="hidden" name="groupId" value={group.id} />

        {fileError && (file || phase !== 'idle') ? (
          <Banner tone="red" icon={AlertCircle} title="That file can't be used">
            {fileError}
          </Banner>
        ) : null}

        {phase === 'idle' || phase === 'failed' ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <TemplateCard downloaded={templateSaved} busy={templateBusy} onDownload={getTemplate} />
            <FileDropzone error={dropzoneError} onBrowse={browse} onDropFile={(dropped) => accept(dropped)} />
          </div>
        ) : null}

        {analysing && file ? (
          <CheckProgress
            file={file}
            phase={phase}
            stage={check.stage}
            percent={check.percent}
            done={check.done}
            total={check.total}
            onCancel={startOver}
          />
        ) : null}

        {phase === 'done' && problem ? (
          <FileProblem problem={problem} onChoose={browse} onTemplate={getTemplate} />
        ) : null}

        {phase === 'done' && result && file && !imported ? (
          <>
            <FileBar file={file} cleaned={Boolean(cleaned)} onChange={browse} />
            <ReviewSummary result={result} />

            {result.failed > 0 && !cleaned ? (
              <>
                <FixOptions
                  failed={result.failed}
                  valid={result.valid}
                  cleaning={cleaning}
                  onReupload={browse}
                  onClean={removeProblemRows}
                />
                <ProblemRows errors={result.errors} issueCounts={result.issueCounts} fileName={result.fileName} />
              </>
            ) : null}

            {cleaned ? (
              <Banner
                tone="blue"
                icon={Sparkles}
                title={`${formatCount(cleaned.removed)} problem ${cleaned.removed === 1 ? 'row was' : 'rows were'} removed`}
                action={
                  <button type="button" onClick={() => saveFile(cleaned.file)} className={textButton}>
                    <Download size={15} strokeWidth={2.2} aria-hidden="true" />
                    Download clean copy
                  </button>
                }
              >
                We made a clean copy with the {formatCount(cleaned.kept)} good rows and attached it below. Your
                original file wasn&apos;t changed.
              </Banner>
            ) : null}

            {result.valid === 0 ? (
              <Banner tone="red" icon={AlertCircle} title="None of the rows can be imported">
                Correct the file and upload it again. The list above shows exactly what to change.
              </Banner>
            ) : null}

            {ready && !imported ? (
              <section aria-labelledby="import-heading" className={`${card} flex flex-wrap items-center gap-4 p-4 sm:p-5`}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E6] text-green">
                  <CheckCircle2 size={22} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="import-heading" className="text-base font-bold text-navy">
                    {result.failed === 0 && !cleaned ? 'Everything looks good. ' : ''}
                    Ready to upload {formatCount(result.valid)} {result.valid === 1 ? 'contact' : 'contacts'}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-ink/60">
                    The file is checked here, then added to <span className="font-semibold text-navy">{group.name}</span> in
                    the background. You can leave the uploads page while it finishes.
                    {result.empty ? ` ${formatCount(result.empty)} blank ${result.empty === 1 ? 'row is' : 'rows are'} skipped.` : ''}
                  </p>
                  {importState.status === 'error' ? (
                    <p role="alert" className="mt-2 text-[13px] text-[#C21F2D]">
                      {importState.error}
                    </p>
                  ) : null}
                </div>
                <button type="submit" disabled={importing} className={primaryButton}>
                  {importing ? <Loader2 size={17} aria-hidden="true" className="animate-spin" /> : null}
                  {importing ? 'Uploading file…' : 'Upload file'}
                </button>
              </section>
            ) : null}
          </>
        ) : null}

        {imported ? (
          <ImportDone
            added={importState.added}
            skipped={result ? result.total - importState.added - result.empty : 0}
            group={group}
            onAnother={startOver}
          />
        ) : null}
      </form>
    </div>
  )
}
