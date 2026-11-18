import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { ActionMenu, actionIconTrigger } from '../../../components/ActionMenu'
import { apiErrorMessage } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import { paths } from '../../../routes/paths'
import { useDeleteSurveyMutation } from '../../../services/api/surveys/surveysApi'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SurveyActions({ survey }) {
  const notify = useNotify()
  const [remove, state] = useDeleteSurveyMutation()
  const [confirm, setConfirm] = useState(false)

  async function perform() {
    try {
      const result = await remove(survey.id).unwrap()
      setConfirm(false)
      notify.success(result.message || 'Survey removed.')
    } catch (error) {
      setConfirm(false)
      notify.error(apiErrorMessage(error))
    }
  }

  return (
    <>
      <ActionMenu
        label={`Actions for ${survey.name}`}
        iconOnly
        triggerClassName={actionIconTrigger}
        items={[
          {
            id: 'view',
            label: 'View survey',
            hint: 'Open this survey',
            icon: Eye,
            color: '#0B63F6',
            tint: '#E3EFFD',
            to: paths.survey(survey.id),
          },
          {
            id: 'edit',
            label: 'Edit',
            hint: 'Change details and questions',
            icon: Pencil,
            color: '#0B1F5B',
            tint: '#F3F6FB',
            to: paths.editSurvey(survey.id),
          },
          'separator',
          {
            id: 'remove',
            label: 'Remove',
            hint: 'Delete this survey',
            icon: Trash2,
            color: '#C21F2D',
            tint: '#FDECEE',
            tone: 'danger',
            disabled: state.isLoading,
            onClick: () => setConfirm(true),
          },
        ]}
      />
      {confirm ? (
        <RemoveDialog
          name={survey.name}
          busy={state.isLoading}
          onConfirm={perform}
          onClose={() => {
            if (state.isLoading) return
            setConfirm(false)
          }}
        />
      ) : null}
    </>
  )
}

function RemoveDialog({ name, busy, onConfirm, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    dialog.querySelector('[data-autofocus]')?.focus()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy || undefined}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (busy) return
        if (event.target === event.currentTarget) onClose()
      }}
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-2xl bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_24px_64px_-16px_rgba(11,31,91,0.55)]"
    >
      <div className="px-6 pt-6 pb-5">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FDECEE] text-[#C21F2D]">
          <Trash2 size={22} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-4 text-lg font-bold tracking-tight text-navy">
          Remove this survey?
        </h2>
        <p className="mt-2 truncate text-sm font-semibold text-navy">{name}</p>
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-ink/70">
          The survey and its questions will be deleted.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-60 ${focusClass}`}
          >
            Not now
          </button>
          <button
            type="button"
            data-autofocus
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center rounded-lg bg-[#C21F2D] px-4 text-sm font-semibold text-white hover:bg-[#9F1C26] disabled:cursor-wait disabled:opacity-70 ${focusClass}`}
          >
            {busy ? 'Removing…' : 'Remove survey'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
