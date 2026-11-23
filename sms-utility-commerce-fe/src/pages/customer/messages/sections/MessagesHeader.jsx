import { UnitsLeft } from '../../../../components/UnitsLeft'
import { NewMessageButton } from './NewMessageButton'

export function MessagesHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">Messages</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          Send to numbers you type, or to contact groups, then follow each report here.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <UnitsLeft />
        <NewMessageButton look="header" />
      </div>
    </header>
  )
}
