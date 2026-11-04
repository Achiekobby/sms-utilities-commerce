import { AlertTriangle, FileSpreadsheet, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useGetUploadSkippedRowsQuery } from '../../../../services/api/contacts/contactRecordsApi'
import { formatCount } from '../../dashboard/format'
import { PageBar } from '../sections/PageBar'
import { formatBytes } from '../upload/rules'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head = 'bg-[#FFF4DF] px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-[#B45F06] uppercase'
const cell = 'border-t border-[#F0D7A8]/60 px-3 py-3 align-middle text-sm text-ink/75'

export function UploadSkippedDrawer({ groupId, upload, onClose }) {
  const [page, setPage] = useState(1)
  const query = useGetUploadSkippedRowsQuery({ groupId, importId: upload.id, page })

  const lastPage = query.data?.lastPage
  if (lastPage && page > lastPage) setPage(lastPage)

  const rows = query.data?.rows ?? []
  const total = query.data?.total ?? (Number(upload.skipped) || 0)

  return (
    <Drawer label={`Skipped rows in ${upload.fileName}`} onClose={onClose} widthClass="w-[min(40rem,calc(100vw-1.5rem))]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4DF] text-[#B45F06]">
              <AlertTriangle size={18} strokeWidth={2.1} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-navy">Skipped rows</h2>
              <p className="mt-0.5 truncate text-[13px] text-ink/60">
                {upload.fileName}
                {upload.fileSize ? ` · ${formatBytes(upload.fileSize)}` : ''}
                {` · ${formatCount(upload.skipped)} left out`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm leading-6 text-ink/60">
            These rows were in the file but were not added as contacts. Use the reason to fix the spreadsheet and upload again if needed.
          </p>

          {query.isLoading ? (
            <div role="status" className="mt-4 space-y-2">
              <span className="sr-only">Loading skipped rows</span>
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} className="skeleton block h-12 rounded-lg" />
              ))}
            </div>
          ) : null}

          {query.isError ? (
            <div role="alert" className="mt-4 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3">
              <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
              <button type="button" onClick={query.refetch} className={`mt-2 cursor-pointer text-sm font-semibold text-navy ${focusClass}`}>
                Try again
              </button>
            </div>
          ) : null}

          {!query.isLoading && !query.isError && rows.length === 0 ? (
            <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-ink/15 px-4 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#FFF4DF] text-[#B45F06]">
                <FileSpreadsheet size={22} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-navy">No skipped-row details yet</p>
              <p className="mt-1 max-w-sm text-sm leading-5 text-ink/55">
                The upload reported skipped rows, but no detail list is available for this file.
              </p>
            </div>
          ) : null}

          {rows.length ? (
            <>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#F0D7A8]">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th scope="col" className={head}>
                        Row
                      </th>
                      <th scope="col" className={head}>
                        Details
                      </th>
                      <th scope="col" className={head}>
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const name = `${row.firstName} ${row.lastName}`.trim()
                      return (
                        <tr key={row.id}>
                          <td className={`${cell} whitespace-nowrap font-semibold text-navy tabular-nums`}>
                            {row.row ? formatCount(row.row) : '—'}
                          </td>
                          <td className={cell}>
                            <p className="font-medium text-navy">{name || row.phone || row.email || 'Row data'}</p>
                            {name && row.phone ? <p className="mt-0.5 text-xs text-ink/55 tabular-nums">{row.phone}</p> : null}
                            {!name && row.email ? <p className="mt-0.5 text-xs text-ink/55">{row.email}</p> : null}
                          </td>
                          <td className={`${cell} text-[#9F1C26]`}>{row.reason || 'Left out during import'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <PageBar
                page={query.data?.page ?? page}
                lastPage={query.data?.lastPage ?? 1}
                total={total}
                perPage={query.data?.perPage ?? 15}
                onPage={setPage}
                label="Skipped row pages"
              />
            </>
          ) : null}
        </div>
      </div>
    </Drawer>
  )
}
