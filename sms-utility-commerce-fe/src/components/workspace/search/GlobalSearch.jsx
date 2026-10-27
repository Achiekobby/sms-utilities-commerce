import { Search } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useAuth } from '../../../utils/hooks/useAuth'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { getSearchEntries } from '../navigation'
import { SearchDialog } from './SearchDialog'

const isApple = /Mac|iPhone|iPad/.test(navigator.userAgent)
const shortcut = isApple ? '⌘K' : 'Ctrl K'

export function GlobalSearch() {
  const search = useDisclosure()
  const { isBusiness } = useAuth()
  const entries = useMemo(() => getSearchEntries({ isBusiness }), [isBusiness])
  const { toggle } = search

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  return (
    <>
      <button
        type="button"
        onClick={search.open}
        aria-label="Search"
        aria-keyshortcuts="Control+K Meta+K"
        className="hidden h-8 w-full max-w-sm items-center gap-2 rounded-lg bg-canvas px-2.5 text-[13px] text-ink/50 ring-1 ring-ink/[0.08] transition-colors hover:bg-white hover:text-ink/70 hover:ring-ink/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue md:flex lg:max-w-md"
      >
        <Search size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
        <span>Search pages and tools</span>
        <kbd className="ml-auto shrink-0 rounded border border-ink/15 bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink/50">
          {shortcut}
        </kbd>
      </button>

      <button
        type="button"
        onClick={search.open}
        aria-label="Search"
        className="flex size-8 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-canvas hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue md:hidden"
      >
        <Search size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {search.isOpen ? <SearchDialog entries={entries} onClose={search.close} /> : null}
    </>
  )
}
