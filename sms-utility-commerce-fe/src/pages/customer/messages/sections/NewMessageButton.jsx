import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '../../../../routes/paths'
import { useGetSenderIdsQuery } from '../../../../services/api/sender-ids/senderIdsApi'
import { NoSenderPrompt } from './NoSenderPrompt'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const looks = {
  header: `inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`,
  empty: `relative mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] ${focusClass}`,
}

export function NewMessageButton({ look = 'header', className = '' }) {
  const navigate = useNavigate()
  const senders = useGetSenderIdsQuery({ page: 1, perPage: 1 })
  const [promptOpen, setPromptOpen] = useState(false)
  const checking = senders.isLoading
  const hasSenders = (senders.data?.total ?? senders.data?.rows?.length ?? 0) > 0

  function goNewMessage() {
    setPromptOpen(false)
    navigate(paths.newMessage)
  }

  function goAddSender() {
    setPromptOpen(false)
    navigate(paths.newSenderId)
  }

  function onClick() {
    if (checking) return
    if (senders.isError || hasSenders) {
      goNewMessage()
      return
    }
    setPromptOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={checking}
        aria-busy={checking || undefined}
        className={`cursor-pointer disabled:cursor-wait disabled:opacity-70 ${looks[look] ?? looks.header} ${className}`}
      >
        <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
        New message
      </button>
      {promptOpen ? (
        <NoSenderPrompt onClose={() => setPromptOpen(false)} onAddSender={goAddSender} onProceed={goNewMessage} />
      ) : null}
    </>
  )
}
