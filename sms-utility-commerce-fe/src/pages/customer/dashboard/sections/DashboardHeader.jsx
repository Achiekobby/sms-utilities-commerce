import { DateRangePicker } from './DateRangePicker'

export function DashboardHeader({ range, onRangeChange }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">
          Client Dashboard
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          Manage your campaigns, messages, contacts and utilities all in one place.
        </p>
      </div>

      <DateRangePicker range={range} onChange={onRangeChange} />
    </header>
  )
}
