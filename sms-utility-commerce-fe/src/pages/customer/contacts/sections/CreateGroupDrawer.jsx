import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, CloudUpload, Info, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Drawer } from '../../../../components/Drawer'
import { apiErrorMessage, fieldErrors } from '../../../../features/auth/client'
import { groupCreated } from '../../../../features/contacts/contactsSlice'
import { paths } from '../../../../routes/paths'
import { useCreateContactGroupMutation } from '../../../../services/api/contacts/contactsApi'
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

function DrawerHeader({ title, subtitle, onClose }) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-navy">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[13px] text-ink/60">{subtitle}</p> : null}
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
  )
}

function GroupForm({ existingNames, submitting, serverErrors = {}, formError = '', onCancel, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [dismissed, setDismissed] = useState({ name: false, description: false })

  const trimmed = name.trim()
  let nameError = ''
  if (!trimmed) nameError = 'Give your group a name.'
  else if (existingNames.has(trimmed.toLowerCase())) nameError = `You already have a group called “${trimmed}”. Choose a different name.`

  function submit(event) {
    event.preventDefault()
    if (submitting) return
    if (nameError) {
      setShowErrors(true)
      return
    }
    setDismissed({ name: false, description: false })
    onCreate({ name: trimmed, description: description.trim() })
  }

  const visibleError = (showErrors ? nameError : '') || (dismissed.name ? '' : serverErrors.name || '')
  const descriptionError = dismissed.description ? '' : serverErrors.description || ''

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="group-name" className="text-sm font-semibold text-navy">
              Group name <span className="text-[#D7192A]">*</span>
            </label>
            <CharCount id="group-name-count" length={name.length} max={groupNameMax} />
          </div>
          <input
            id="group-name"
            name="name"
            type="text"
            data-autofocus
            autoComplete="off"
            required
            maxLength={groupNameMax}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setDismissed((current) => ({ ...current, name: true }))
            }}
            disabled={submitting}
            onBlur={() => name && setShowErrors(true)}
            placeholder="e.g. Church members, Spring customers"
            aria-invalid={visibleError ? true : undefined}
            aria-describedby={`group-name-count ${visibleError ? 'group-name-error' : 'group-name-hint'}`}
            className={`${fieldClass} mt-1.5 h-11 ${visibleError ? 'border-[#D7192A]' : 'border-ink/15'}`}
          />
          {visibleError ? (
            <p id="group-name-error" role="alert" className="mt-1.5 text-[13px] text-[#C21F2D]">
              {visibleError}
            </p>
          ) : (
            <p id="group-name-hint" className="mt-1.5 text-[13px] text-ink/55">
              Pick something short you will recognise when sending a message.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="group-description" className="text-sm font-semibold text-navy">
              Description <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <CharCount id="group-description-count" length={description.length} max={groupDescriptionMax} />
          </div>
          <textarea
            id="group-description"
            name="description"
            rows={4}
            maxLength={groupDescriptionMax}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setDismissed((current) => ({ ...current, description: true }))
            }}
            disabled={submitting}
            placeholder="Who is in this group, or what will you use it for?"
            aria-invalid={descriptionError ? true : undefined}
            aria-describedby={descriptionError ? 'group-description-error' : 'group-description-count'}
            className={`${fieldClass} mt-1.5 resize-none py-2.5 leading-6 ${descriptionError ? 'border-[#D7192A]' : 'border-ink/15'}`}
          />
          {descriptionError ? (
            <p id="group-description-error" role="alert" className="mt-1.5 text-[13px] text-[#C21F2D]">
              {descriptionError}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p role="alert" className="rounded-lg bg-[#FDECEE] px-3 py-2 text-[13px] leading-5 text-[#9F1C26]">
            {formError}
          </p>
        ) : null}

        <div className="flex gap-3 rounded-xl bg-[#EEF5FE] p-3.5 text-[13px] leading-5 text-navy/80">
          <Info size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-blue" />
          <p>
            Your group starts empty. Right after creating it, you can add contacts by uploading an Excel file.
          </p>
        </div>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-4">
        <button type="button" onClick={onCancel} disabled={submitting} className={`${secondaryButton} disabled:opacity-60`}>
          <X size={15} strokeWidth={2.2} aria-hidden="true" />
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={`${primaryButton} disabled:cursor-wait disabled:opacity-70`}>
          <Plus size={16} strokeWidth={2.3} aria-hidden="true" />
          {submitting ? 'Creating group' : 'Create group'}
        </button>
      </footer>
    </form>
  )
}

function SuccessView({ group, onUpload, onView, onClose }) {
  const reduce = useReducedMotion()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <motion.div
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="relative flex size-20 items-center justify-center rounded-full bg-[#DDF3E6]"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-green text-white shadow-[0_8px_20px_-8px_rgba(21,148,71,0.8)]">
            <Check size={30} strokeWidth={3} aria-hidden="true" />
          </span>
        </motion.div>

        <h2 id="group-created-title" className="mt-6 text-xl font-bold tracking-tight text-navy">
          Group created
        </h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-ink/65">
          <span className="font-semibold text-navy">{group.name}</span> is ready. It is empty for now, so let&apos;s
          add your contacts.
        </p>

        <div className="mt-6 w-full max-w-xs space-y-2.5">
          <button type="button" autoFocus onClick={onUpload} className={`${primaryButton} h-11 w-full`}>
            <CloudUpload size={18} strokeWidth={2} aria-hidden="true" />
            Upload contacts
          </button>
          <button type="button" onClick={onView} className={`${secondaryButton} h-11 w-full`}>
            View group
            <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        <p className="mt-5 max-w-xs text-[13px] leading-5 text-ink/55">
          You&apos;ll upload an Excel file, and we&apos;ll check it for mistakes before anything is added.
        </p>
      </div>

      <footer className="border-t border-ink/10 px-5 py-3 text-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded text-[13px] font-semibold text-ink/60 hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          I&apos;ll do this later
        </button>
      </footer>
    </div>
  )
}

// Create a group, then offer the next step. Both views live in one drawer so nothing flashes closed
// and reopened between them.
export function CreateGroupDrawer({ groups, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [createGroup, { isLoading: submitting }] = useCreateContactGroupMutation()
  const [created, setCreated] = useState(null)
  const [serverErrors, setServerErrors] = useState({})
  const [formError, setFormError] = useState('')

  const existingNames = new Set(groups.map((group) => group.name.trim().toLowerCase()))

  async function create(values) {
    setServerErrors({})
    setFormError('')

    try {
      const group = await createGroup(values).unwrap()
      if (!group?.id) {
        setFormError('Something went wrong. Try again.')
        return
      }
      dispatch(groupCreated(group))
      setCreated(group)
    } catch (error) {
      const fields = fieldErrors(error)
      setServerErrors(fields)
      setFormError(fields.name || fields.description ? '' : apiErrorMessage(error))
    }
  }

  return (
    <Drawer label={created ? 'Group created' : 'Create group'} side="right" onClose={onClose}>
      <div className="flex h-full flex-col bg-white">
        <DrawerHeader
          title={created ? 'All done' : 'Create a group'}
          subtitle={created ? null : 'Groups keep your contacts organised so you can message the right people.'}
          onClose={onClose}
        />

        {created ? (
          <SuccessView
            group={created}
            onUpload={() => navigate(paths.contactUpload(created.id))}
            onView={() => navigate(paths.contactGroup(created.id))}
            onClose={onClose}
          />
        ) : (
          <GroupForm
            existingNames={existingNames}
            submitting={submitting}
            serverErrors={serverErrors}
            formError={formError}
            onCancel={onClose}
            onCreate={create}
          />
        )}
      </div>
    </Drawer>
  )
}
