import { apiErrorMessage } from '../../../features/auth/client'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { MessageList } from './sections/MessageList'
import { MessagesHeader } from './sections/MessagesHeader'
import { useMessages } from './useMessages'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function MessagesPage() {
  useDocumentTitle('Messages')
  const { messages, isLoading, isFetching, isError, error, refetch } = useMessages({ page: 1, perPage: 100 })

  return (
    <div>
      <MessagesHeader />
      <div aria-busy={isFetching || undefined}>
        {isLoading ? (
          <div role="status" className="mt-6 space-y-2">
            <span className="sr-only">Loading messages</span>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className="skeleton block h-12 rounded-lg" />
            ))}
          </div>
        ) : null}

        {isError && !messages.length ? (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className={`h-9 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {!isLoading && !(isError && !messages.length) ? <MessageList messages={messages} /> : null}
      </div>
    </div>
  )
}
