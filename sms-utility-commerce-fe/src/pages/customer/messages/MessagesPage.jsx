import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { MessageList } from './sections/MessageList'
import { MessagesHeader } from './sections/MessagesHeader'
import { useMessages } from './useMessages'

export function MessagesPage() {
  useDocumentTitle('Messages')
  const messages = useMessages()

  return (
    <div>
      <MessagesHeader />
      <MessageList messages={messages} />
    </div>
  )
}
