import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePermissions } from '../../features/auth/usePermissions'
import { getSearchEntries } from './navigation'
import { SearchDialog } from './SearchDialog'

const shortcut = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K'

export function AdminSearch() {
  const access = usePermissions()
  const entries = useMemo(() => getSearchEntries(access), [access])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search pages"
        aria-keyshortcuts="Control+K Meta+K"
        className="hidden h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md bg-canvas px-2.5 text-left text-[13px] text-ink/45 ring-1 ring-ink/10 transition-colors duration-150 hover:bg-white hover:text-ink/70 hover:ring-ink/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:flex sm:max-w-xs lg:max-w-sm"
      >
        <Search size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
        <span className="truncate">Search pages</span>
        <kbd className="ml-auto shrink-0 rounded border border-ink/10 bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink/45">
          {shortcut}
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search pages"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink/70 transition-colors duration-150 hover:bg-ink/[0.04] hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:hidden"
      >
        <Search size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {open ? <SearchDialog entries={entries} onClose={() => setOpen(false)} /> : null}
    </>
  )
}
