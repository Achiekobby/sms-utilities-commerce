import { formatCount } from '../../../dashboard/format'
import { card } from '../ui'

const tiles = [
  { key: 'total', label: 'Rows in your file', color: '#0B63F6', tint: '#E3EFFD', hint: 'Every row under the column names' },
  { key: 'valid', label: 'Ready to import', color: '#008859', tint: '#DDF3E6', hint: 'Passed every check' },
  { key: 'failed', label: 'Need attention', color: '#D7192A', tint: '#FFDFE1', hint: 'Something is missing or wrong' },
  { key: 'empty', label: 'Blank rows', color: '#6B7A90', tint: '#EAEFF6', hint: 'Skipped automatically' },
]

// The headline numbers: total rows split into good, bad and blank. The three parts always add up to the total.
export function ReviewSummary({ result }) {
  const parts = [
    { key: 'valid', value: result.valid, color: '#008859', label: 'ready' },
    { key: 'failed', value: result.failed, color: '#E5384F', label: 'need attention' },
    { key: 'empty', value: result.empty, color: '#C5CFDD', label: 'blank' },
  ]

  return (
    <section aria-label="Results of the check" className={`${card} p-4 sm:p-5`}>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.key} className="rounded-xl border border-[#E1EAF6] p-3.5">
            <dt className="flex items-center gap-2 text-xs font-semibold text-navy">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: tile.color }} />
              {tile.label}
            </dt>
            <dd
              className="mt-1.5 text-2xl leading-8 font-bold tracking-tight tabular-nums"
              style={{ color: tile.key === 'total' ? '#0b1f5b' : tile.color }}
            >
              {formatCount(result[tile.key])}
            </dd>
            <p className="mt-0.5 text-xs text-ink/50">{tile.hint}</p>
          </div>
        ))}
      </dl>

      <div
        role="img"
        aria-label={parts.map((part) => `${formatCount(part.value)} ${part.label}`).join(', ')}
        className="mt-4 flex h-2.5 gap-px overflow-hidden rounded-full bg-[#EEF3FA]"
      >
        {parts.map((part) => (
          <span
            key={part.key}
            className="h-full min-w-[3px] transition-[width] duration-500"
            style={{
              width: `${result.total ? (part.value / result.total) * 100 : 0}%`,
              backgroundColor: part.color,
              display: part.value ? undefined : 'none',
            }}
          />
        ))}
      </div>

      {result.trailingBlank > 0 ? (
        <p className="mt-3 text-xs text-ink/50">
          {formatCount(result.trailingBlank)} empty {result.trailingBlank === 1 ? 'row' : 'rows'} at the bottom of the sheet{' '}
          {result.trailingBlank === 1 ? 'was' : 'were'} ignored.
        </p>
      ) : null}
    </section>
  )
}
