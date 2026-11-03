import { ArrowLeft, CloudUpload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { apiErrorMessage } from '../../../../features/auth/client'
import { paths } from '../../../../routes/paths'
import { useDocumentTitle } from '../../../../utils/hooks/useDocumentTitle'
import { useContactGroup } from '../useGroups'
import { PageBar } from '../sections/PageBar'
import { UploadCard } from './UploadCard'
import { useUploadWatch } from './useUploadWatch'
import { useGetContactImportQuery } from '../../../../services/api/contacts/contactRecordsApi'

const backLink =
  'inline-flex items-center gap-1.5 rounded text-sm font-semibold text-blue hover:text-[#0056D6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue'

export function ContactUploadsPage() {
  const { groupId } = useParams()
  const location = useLocation()
  const focusId = typeof location.state?.importId === 'string' ? location.state.importId : ''
  const { group } = useContactGroup(groupId)
  const [page, setPage] = useState(1)
  const list = useUploadWatch(groupId, page)
  const rows = list.data?.rows ?? []
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

  let announce = ''
  if (watching?.running) announce = `${watching.fileName} is ${watching.status}. ${watching.progress} percent done.`
  else if (watching?.status === 'completed') announce = `${watching.fileName} finished. ${watching.inserted} contacts added.`
  else if (watching?.status === 'failed') announce = `${watching.fileName} failed.`

  const waiting = list.isLoading
  const featured = watching && !onThisPage ? watching : null

  return (
    <div className="w-full min-w-0">
      <Link to={paths.contactGroup(groupId)} className={backLink}>
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        Back to {group?.name || 'group'}
      </Link>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Uploads</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
            Files for <span className="font-semibold text-navy">{group?.name || 'this group'}</span> are added in the
            background. This page keeps checking until each one finishes.
          </p>
        </div>
        <Link
          to={paths.contactUpload(groupId)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <CloudUpload size={16} strokeWidth={2.2} aria-hidden="true" />
          Upload a file
        </Link>
      </header>

      <p role="status" className="sr-only">
        {announce || location.state?.notice || ''}
      </p>

      {location.state?.notice ? (
        <p className="mt-4 rounded-xl border border-green/25 bg-[#F3FBF6] px-4 py-3 text-sm text-[#0E6B3C]">
          {location.state.notice}
        </p>
      ) : null}

      {waiting ? (
        <div role="status" className="mt-5 space-y-3">
          <span className="sr-only">Loading uploads</span>
          {Array.from({ length: 3 }, (_, index) => (
            <span key={index} className="skeleton block h-36 rounded-xl" />
          ))}
        </div>
      ) : null}

      {list.isError ? (
        <div role="alert" className="mt-5 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(list.error)}</p>
          <button
            type="button"
            onClick={list.refetch}
            className="mt-2 text-sm font-semibold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!waiting && !list.isError ? (
        <div className="mt-5 space-y-3">
          {featured ? <UploadCard item={featured} featured /> : null}
          {rows.map((item) => (
            <UploadCard key={item.id} item={item} featured={item.id === focusId} />
          ))}
          {!rows.length && !featured ? (
            <div className="rounded-xl border border-dashed border-ink/15 px-4 py-14 text-center">
              <p className="text-sm font-semibold text-navy">No files uploaded yet</p>
              <p className="mt-1 text-sm text-ink/55">Upload an Excel file and it will show up here while it is added.</p>
            </div>
          ) : null}
          <PageBar
            page={list.data?.page ?? page}
            lastPage={list.data?.lastPage ?? 1}
            total={list.data?.total ?? 0}
            perPage={list.data?.perPage ?? 15}
            onPage={setPage}
            label="Upload pages"
          />
        </div>
      ) : null}
    </div>
  )
}
