import { ArrowLeft, CloudUpload, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useNotify } from '../../../../features/notifications/useNotify'
import { paths } from '../../../../routes/paths'
import { useGetContactImportQuery } from '../../../../services/api/contacts/contactRecordsApi'
import { useDocumentTitle } from '../../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../../dashboard/format'
import { PageBar } from '../sections/PageBar'
import { useContactGroup } from '../useGroups'
import { UploadContactsDrawer } from './UploadContactsDrawer'
import { UploadSkippedDrawer } from './UploadSkippedDrawer'
import { UploadsTable } from './UploadsTable'
import { useUploadActions } from './useUploadActions.jsx'
import { useUploadWatch } from './useUploadWatch'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const backButton =
  `inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink/15 bg-white px-3.5 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.05)] transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue ${focusClass}`
const uploadButton =
  `inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.2)] transition-colors hover:bg-[#006B46] ${focusClass}`

// Full-bleed white pane: data-page-bleed cancels workspace main padding.
const pageShell =
  'w-full min-w-0 max-w-none bg-white min-h-[calc(100svh-3.5rem)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 xl:px-10 2xl:px-12'

function LiveBanner({ item }) {
  if (!item?.running) return null

  const width = Math.max(item.progress, 8)

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-blue/20 bg-gradient-to-br from-[#F3F8FF] to-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.35)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FE] text-blue">
          <Loader2 size={18} strokeWidth={2.2} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">{item.fileName}</p>
              <p className="mt-0.5 text-xs text-ink/55">
                {item.status === 'queued' ? 'Queued and waiting to start' : 'Adding contacts in the background'}
                {item.chunksExpected > 0 ? ` · ${item.chunksDone}/${item.chunksExpected} chunks` : ''}
              </p>
            </div>
            <p className="text-sm font-bold text-blue tabular-nums">{item.progress}%</p>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-blue/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.progress}
            aria-label={`${item.fileName} progress`}
          >
            <div className="relative h-full rounded-full bg-blue transition-[width] duration-500 ease-out" style={{ width: `${width}%` }}>
              <span className="upload-slide absolute inset-y-0 w-1/3 bg-white/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryStrip({ items }) {
  if (!items.length) return null

  const totals = { total: items.length, running: 0, completed: 0, failed: 0, added: 0 }
  items.forEach((item) => {
    if (item.running) totals.running += 1
    if (item.status === 'completed') totals.completed += 1
    if (item.status === 'failed') totals.failed += 1
    totals.added += Number(item.inserted) || 0
  })

  const cells = [
    { label: 'On this page', value: formatCount(totals.total) },
    { label: 'In progress', value: formatCount(totals.running), accent: totals.running ? 'text-blue' : '' },
    { label: 'Completed', value: formatCount(totals.completed), accent: totals.completed ? 'text-green' : '' },
    { label: 'Failed', value: formatCount(totals.failed), accent: totals.failed ? 'text-[#C21F2D]' : '' },
    { label: 'Contacts added', value: formatCount(totals.added) },
  ]

  return (
    <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#D8E7FA] bg-[#E7EEF8] shadow-[0_1px_2px_rgba(20,115,230,0.04),0_10px_24px_-18px_rgba(11,31,91,0.35)] sm:grid-cols-3 lg:grid-cols-5">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-white px-4 py-3.5">
          <dt className="text-[11px] font-semibold tracking-wide text-ink/50 uppercase">{cell.label}</dt>
          <dd className={`mt-1 text-xl font-bold tracking-tight tabular-nums ${cell.accent || 'text-navy'}`}>{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ContactUploadsPage() {
  const { groupId } = useParams()
  const location = useLocation()
  const focusId = typeof location.state?.importId === 'string' ? location.state.importId : ''
  const { group } = useContactGroup(groupId)
  const [page, setPage] = useState(1)
  const [managingUpload, setManagingUpload] = useState(null)
  const [skippedUpload, setSkippedUpload] = useState(null)
  const notify = useNotify()
  const list = useUploadWatch(groupId, page)
  const { askDelete, dialog: deleteDialog } = useUploadActions({
    groupId,
    onDone(message) {
      notify.success(message)
      setManagingUpload(null)
      setSkippedUpload(null)
    },
  })
  const rows = useMemo(() => list.data?.rows ?? [], [list.data])
  const onThisPage = rows.some((item) => item.id === focusId)
  const focused = useGetContactImportQuery({ groupId, importId: focusId }, { skip: !focusId || onThisPage })
  const watching = onThisPage ? rows.find((item) => item.id === focusId) : focused.data
  const refetchFocused = focused.refetch

  useDocumentTitle(group ? `Uploads · ${group.name}` : 'Uploads')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [groupId])

  useEffect(() => {
    if (!focusId || onThisPage || !focused.data?.running) return undefined
    const timer = setInterval(() => {
      refetchFocused()
    }, 2000)
    return () => clearInterval(timer)
  }, [focusId, focused.data, onThisPage, refetchFocused])

  const items = useMemo(() => {
    if (!watching || onThisPage) return rows
    return [watching, ...rows.filter((item) => item.id !== watching.id)]
  }, [onThisPage, rows, watching])

  let announce = ''
  if (watching?.running) announce = `${watching.fileName} is ${watching.status}. ${watching.progress} percent done.`
  else if (watching?.status === 'completed') announce = `${watching.fileName} finished. ${watching.inserted} contacts added.`
  else if (watching?.status === 'failed') announce = `${watching.fileName} failed.`

  const waiting = list.isLoading
  const serverPages = list.data?.lastPage ?? 1
  const liveItem = watching?.running ? watching : items.find((item) => item.running)

  return (
    <div data-page-bleed className={pageShell}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-ink/45 uppercase">Contact group</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">Uploads</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
            Files for <span className="font-semibold text-navy">{group?.name || 'this group'}</span> are added in the
            background. This page keeps checking until each one finishes.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Link to={paths.contactGroup(groupId)} className={backButton}>
            <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
            Back to {group?.name || 'group'}
          </Link>
          <Link to={paths.contactUpload(groupId)} className={uploadButton}>
            <CloudUpload size={16} strokeWidth={2.2} aria-hidden="true" />
            Upload a file
          </Link>
        </div>
      </header>

      <p role="status" className="sr-only">
        {announce}
      </p>

      {waiting ? (
        <div role="status" className="mt-1">
          <span className="sr-only">Loading uploads</span>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#D8E7FA] bg-[#E7EEF8] sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="bg-white px-4 py-3.5">
                <span className="skeleton block h-3 w-20 rounded" />
                <span className="skeleton mt-2 block h-7 w-14 rounded" />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <span className="skeleton h-10 w-full max-w-md rounded-lg" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} className="skeleton h-9 w-[4.75rem] rounded-lg" />
                ))}
              </div>
            </div>

            <span className="skeleton mt-3 block h-4 w-24 rounded" />

            <div className="mt-4 hidden overflow-hidden rounded-xl border border-[#D8E7FA] md:block">
              <div className="grid grid-cols-[minmax(0,2fr)_7rem_minmax(7rem,1fr)_5rem_5rem_5rem_5rem_7rem] gap-3 border-b border-[#E1EAF6] bg-[#F3F7FD] px-4 py-3">
                {Array.from({ length: 8 }, (_, index) => (
                  <span key={index} className="skeleton h-3 w-full max-w-[4.5rem] rounded" />
                ))}
              </div>
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,2fr)_7rem_minmax(7rem,1fr)_5rem_5rem_5rem_5rem_7rem] items-center gap-3 border-b border-[#E7EEF8] px-4 py-3.5 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="skeleton size-10 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <span className="skeleton block h-4 w-48 max-w-full rounded" />
                      <span className="skeleton block h-3 w-24 rounded" />
                    </div>
                  </div>
                  <span className="skeleton h-6 w-20 rounded-full" />
                  <div className="space-y-1.5">
                    <span className="skeleton block h-3 w-full rounded" />
                    <span className="skeleton block h-1.5 w-full rounded-full" />
                  </div>
                  <span className="skeleton ml-auto block h-4 w-10 rounded" />
                  <span className="skeleton ml-auto block h-4 w-10 rounded" />
                  <span className="skeleton ml-auto block h-4 w-8 rounded" />
                  <span className="skeleton ml-auto block h-4 w-8 rounded" />
                  <span className="skeleton block h-4 w-20 rounded" />
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:hidden">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-xl border border-[#D8E7FA] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="skeleton size-10 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <span className="skeleton block h-4 w-40 max-w-full rounded" />
                        <span className="skeleton block h-3 w-20 rounded" />
                      </div>
                    </div>
                    <span className="skeleton h-6 w-20 shrink-0 rounded-full" />
                  </div>
                  <div className="mt-3.5 space-y-1.5">
                    <span className="skeleton block h-3 w-full rounded" />
                    <span className="skeleton block h-1.5 w-full rounded-full" />
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 4 }, (_, cell) => (
                      <span key={cell} className="skeleton h-12 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="skeleton h-4 w-40 rounded" />
              <span className="skeleton h-8 w-36 rounded-lg" />
            </div>
          </div>
        </div>
      ) : null}

      {list.isError ? (
        <div role="alert" className="mt-6 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(list.error)}</p>
          <button type="button" onClick={list.refetch} className={`mt-2 cursor-pointer text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : null}

      {!waiting && !list.isError ? (
        <div className="mt-1">
          <SummaryStrip items={items} />
          <LiveBanner item={liveItem} />

          {items.length ? (
            <div className="mt-6">
              <UploadsTable
                items={items}
                featuredId={focusId}
                onViewContacts={setManagingUpload}
                onReviewSkipped={setSkippedUpload}
                onDelete={askDelete}
              />
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-ink/15 bg-[#F8FBFF] px-4 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#E3EFFD] text-blue">
                <FileSpreadsheet size={26} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <p className="mt-4 text-base font-bold text-navy">No files uploaded yet</p>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-ink/55">
                Upload an Excel file and it will show up here while contacts are added to the group.
              </p>
              <Link
                to={paths.contactUpload(groupId)}
                className={`mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white transition-colors hover:bg-[#006B46] ${focusClass}`}
              >
                <CloudUpload size={16} strokeWidth={2.2} aria-hidden="true" />
                Upload a file
              </Link>
            </div>
          )}

          {serverPages > 1 ? (
            <PageBar
              page={list.data?.page ?? page}
              lastPage={serverPages}
              total={list.data?.total ?? 0}
              perPage={list.data?.perPage ?? 15}
              onPage={setPage}
              label="Upload server pages"
              className="mt-5"
            />
          ) : null}
        </div>
      ) : null}

      {managingUpload ? (
        <UploadContactsDrawer groupId={groupId} upload={managingUpload} onClose={() => setManagingUpload(null)} />
      ) : null}
      {skippedUpload ? (
        <UploadSkippedDrawer groupId={groupId} upload={skippedUpload} onClose={() => setSkippedUpload(null)} />
      ) : null}
      {deleteDialog}
    </div>
  )
}
