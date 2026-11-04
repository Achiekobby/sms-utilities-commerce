import { X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Drawer } from '../../../../components/Drawer'
import { useNotify } from '../../../../features/notifications/useNotify'
import { apiErrorMessage, fieldErrors } from '../../../../features/auth/client'
import { groupUpdated } from '../../../../features/contacts/contactsSlice'
import { contactsApi, useUpdateContactGroupMutation } from '../../../../services/api/contacts/contactsApi'
import { groupDescriptionMax, groupNameMax } from '../limits'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const fieldClass =
  'w-full rounded-lg border bg-white px-3 text-sm text-navy placeholder:text-ink/40 transition-colors focus-visible:border-blue/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue'

const primaryButton = `inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`

const secondaryButton = `inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold whitespace-nowrap text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`

function CharCount({ id, length, max }) {
  const near = length >= max * 0.9
  const full = length >= max

  return (
    <span
      id={id}
      className={`text-xs tabular-nums ${full ? 'font-semibold text-[#B45F06]' : near ? 'text-[#B45F06]' : 'text-ink/50'}`}
    >
      {length}/{max}
      {full ? <span className="sr-only"> — character limit reached</span> : null}
    </span>
  )
}

function savedNote(group) {
  if (typeof group.note === 'string') return group.note
  return group.description === 'No description yet' ? '' : (group.description ?? '')
}

export function EditGroupDrawer({ group, groups = [], onClose }) {
  const dispatch = useDispatch()
  const notify = useNotify()
  const cached = useSelector((state) => contactsApi.endpoints.getContactGroups.select()(state)?.data ?? [])
  const [updateGroup, { isLoading: submitting }] = useUpdateContactGroupMutation()
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(savedNote(group))
  const [showErrors, setShowErrors] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [dismissed, setDismissed] = useState({ name: false, description: false })

  const known = groups.length ? groups : cached
  const existingNames = new Set(
    known.filter((item) => String(item.id) !== String(group.id)).map((item) => item.name.trim().toLowerCase()),
  )
  const trimmed = name.trim()
  const trimmedDescription = description.trim()
  const dirty = trimmed !== group.name || trimmedDescription !== savedNote(group).trim()

  let nameError = ''
  if (!trimmed) nameError = 'Give your group a name.'
  else if (existingNames.has(trimmed.toLowerCase())) nameError = `You already have a group called “${trimmed}”. Choose a different name.`

  const visibleError = (showErrors ? nameError : '') || (dismissed.name ? '' : serverErrors.name || '')
  const descriptionError = dismissed.description ? '' : serverErrors.description || ''

  async function submit(event) {
    event.preventDefault()
    if (submitting) return
    if (nameError) {
      setShowErrors(true)
      return
    }
    if (!dirty) {
      onClose()
      return
    }

    setDismissed({ name: false, description: false })
    setServerErrors({})
    setFormError('')

    try {
      const updated = await updateGroup({
        id: group.id,
        name: trimmed,
        description: trimmedDescription,
      }).unwrap()
      if (updated) dispatch(groupUpdated(updated))
      notify.success('Group updated.')
      onClose()
    } catch (error) {
      const fields = fieldErrors(error)
      setServerErrors(fields)
      setFormError(fields.name || fields.description ? '' : apiErrorMessage(error))
    }
  }

  return (
    <Drawer label="Edit group" side="right" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex h-full flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-navy">Edit group</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Change the name or description. Contacts in the group stay as they are.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="edit-group-name" className="text-sm font-semibold text-navy">
                Group name <span className="text-[#D7192A]">*</span>
              </label>
              <CharCount id="edit-group-name-count" length={name.length} max={groupNameMax} />
            </div>
            <input
              id="edit-group-name"
              name="name"
              type="text"
              data-autofocus
              autoComplete="off"
              required
              maxLength={groupNameMax}
              value={name}
              disabled={submitting}
              onChange={(event) => {
                setName(event.target.value)
                setDismissed((current) => ({ ...current, name: true }))
              }}
              onBlur={() => name && setShowErrors(true)}
              aria-invalid={visibleError ? true : undefined}
              aria-describedby={`edit-group-name-count ${visibleError ? 'edit-group-name-error' : 'edit-group-name-hint'}`}
              className={`${fieldClass} mt-1.5 h-11 ${visibleError ? 'border-[#D7192A]' : 'border-ink/15'}`}
            />
            {visibleError ? (
              <p id="edit-group-name-error" role="alert" className="mt-1.5 text-[13px] text-[#C21F2D]">
                {visibleError}
              </p>
            ) : (
              <p id="edit-group-name-hint" className="mt-1.5 text-[13px] text-ink/55">
                Pick something short you will recognise when sending a message.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="edit-group-description" className="text-sm font-semibold text-navy">
                Description <span className="font-normal text-ink/50">(optional)</span>
              </label>
              <CharCount id="edit-group-description-count" length={description.length} max={groupDescriptionMax} />
            </div>
            <textarea
              id="edit-group-description"
              name="description"
              rows={4}
              maxLength={groupDescriptionMax}
              value={description}
              disabled={submitting}
              onChange={(event) => {
                setDescription(event.target.value)
                setDismissed((current) => ({ ...current, description: true }))
              }}
              placeholder="Who is in this group, or what will you use it for?"
              aria-invalid={descriptionError ? true : undefined}
              aria-describedby={descriptionError ? 'edit-group-description-error' : 'edit-group-description-count'}
              className={`${fieldClass} mt-1.5 resize-none py-2.5 leading-6 ${descriptionError ? 'border-[#D7192A]' : 'border-ink/15'}`}
            />
            {descriptionError ? (
              <p id="edit-group-description-error" role="alert" className="mt-1.5 text-[13px] text-[#C21F2D]">
                {descriptionError}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p role="alert" className="rounded-lg bg-[#FDECEE] px-3 py-2 text-[13px] leading-5 text-[#9F1C26]">
              {formError}
            </p>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-4">
          <button type="button" onClick={onClose} disabled={submitting} className={`${secondaryButton} disabled:opacity-60`}>
            <X size={15} strokeWidth={2.2} aria-hidden="true" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !dirty}
            className={`${primaryButton} disabled:opacity-70 ${submitting ? 'disabled:cursor-wait' : 'disabled:cursor-not-allowed'}`}
          >
            {submitting ? 'Saving changes' : 'Save changes'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
