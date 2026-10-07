import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { usePagination } from '../../../../../utils/hooks/usePagination'
import { formatCount } from '../../../dashboard/format'
import { issueLabels } from '../rules'
import { card, focusClass, textButton } from '../ui'

const PAGE_SIZE = 8

const pageButton = `flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`

function csvCell(value) {
  const textValue = String(value ?? '')
  return /[",\n]/.test(textValue) ? `"${textValue.replace(/"/g, '""')}"` : textValue
}

// A plain CSV opens in Excel and is easy to share with whoever owns the data.
function downloadErrorReport(errors, fileName) {
  const lines = [
    ['Excel row', 'Name', 'Phone number as entered', 'Column', 'What to fix'].map(csvCell).join(','),
    ...errors.flatMap((entry) =>
      entry.issues.map((issue) => [entry.row, entry.name, entry.phone, issue.field, issue.message].map(csvCell).join(',')),
    ),
  ]

  const url = URL.createObjectURL(new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName.replace(/\.xlsx$/i, '')}-problems.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// Every failed row with its Excel row number, so the problem can be found and fixed in the sheet.
// Only one page is rendered at a time, so a file with thousands of bad rows costs no more than one with a few.
export function ProblemRows({ errors, issueCounts, fileName }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(
    () => (filter === 'all' ? errors : errors.filter((entry) => entry.issues.some((issue) => issue.code === filter))),
    [errors, filter],
  )
  const pager = usePagination({ total: filtered.length, pageSize: PAGE_SIZE })
  const page = filtered.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)

  const chips = [
    { code: 'all', label: 'All problems', count: errors.length },
    ...Object.entries(issueCounts).map(([code, count]) => ({ code, label: issueLabels[code] ?? code, count })),
  ]

  function choose(code) {
    setFilter(code)
    pager.setPage(1)
  }

  return (
    <section aria-labelledby="problems-heading" className={`${card} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="problems-heading" className="text-base font-bold text-navy">
            Rows to fix
          </h2>
          <p className="mt-0.5 text-[13px] text-ink/60">
            The row number matches the number on the left of your Excel sheet.
          </p>
        </div>
        <button type="button" onClick={() => downloadErrorReport(errors, fileName)} className={textButton}>
          <Download size={15} strokeWidth={2.2} aria-hidden="true" />
          Download list (.csv)
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter problems">
        {chips.map((chip) => {
          const active = filter === chip.code
          return (
            <button
              key={chip.code}
              type="button"
              aria-pressed={active}
              onClick={() => choose(chip.code)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${focusClass} ${
                active
                  ? 'border-blue bg-blue text-white'
                  : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
              }`}
            >
              {chip.label}
              <span className={`tabular-nums ${active ? 'text-white/80' : 'text-ink/50'}`}>{formatCount(chip.count)}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-xl border border-[#E1EAF6] sm:block">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-[#F3F7FD] text-xs text-navy">
              <th scope="col" className="w-24 px-3 py-2.5 font-semibold">
                Excel row
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                Contact
              </th>
              <th scope="col" className="px-3 py-2.5 font-semibold">
                What to fix
              </th>
            </tr>
          </thead>
          <tbody>
            {page.map((entry) => (
              <tr key={entry.row} className="border-t border-[#E7EEF8] align-top">
                <td className="px-3 py-3">
                  <span className="inline-flex rounded-md bg-[#FFE4E6] px-2 py-0.5 text-xs font-bold text-[#B8141F] tabular-nums">
                    Row {formatCount(entry.row)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-navy">{entry.name || <span className="font-normal text-ink/40">No name</span>}</p>
                  <p className="text-xs text-ink/55 tabular-nums">{entry.phone || <span className="text-ink/40">No phone number</span>}</p>
                </td>
                <td className="px-3 py-3">
                  <ul className="space-y-1">
                    {entry.issues.map((issue) => (
                      <li key={issue.code} className="flex gap-2 text-ink/80">
                        <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#E5384F]" />
                        <span>
                          <span className="font-semibold text-navy">{issue.field}:</span> {issue.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-xl border border-[#E1EAF6] sm:hidden">
        {page.map((entry) => (
          <li key={entry.row} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-[#FFE4E6] px-2 py-0.5 text-xs font-bold text-[#B8141F] tabular-nums">
                Row {formatCount(entry.row)}
              </span>
              <span className="truncate text-xs text-ink/55 tabular-nums">{entry.phone || 'No phone number'}</span>
            </div>
            <p className="mt-1.5 text-[13px] font-semibold text-navy">{entry.name || 'No name'}</p>
            <ul className="mt-1.5 space-y-1">
              {entry.issues.map((issue) => (
                <li key={issue.code} className="text-xs leading-5 text-ink/75">
                  <span className="font-semibold text-navy">{issue.field}:</span> {issue.message}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <p className="text-ink/60 tabular-nums">
          Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(filtered.length)}
        </p>
        <nav aria-label="Problem pages" className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous page" disabled={pager.page === 1} onClick={pager.previous} className={pageButton}>
            <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
          <span className="px-2 text-ink/60 tabular-nums">
            Page {formatCount(pager.page)} of {formatCount(pager.pageCount)}
          </span>
          <button type="button" aria-label="Next page" disabled={pager.page === pager.pageCount} onClick={pager.next} className={pageButton}>
            <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </section>
  )
}
