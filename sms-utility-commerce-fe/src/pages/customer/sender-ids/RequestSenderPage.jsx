import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { selectCurrentUser } from '../../../features/auth/authSlice'
import { senderIdRequested } from '../../../features/sender-ids/senderIdsSlice'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { getIdentity } from '../../../components/workspace/identity'
import { senderIdError, senderIdMax } from './rules'
import { useSenderIds } from './useSenderIds'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none transition-all duration-200 placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'
const labelClass = 'mb-2 block text-sm font-medium text-navy'
const errorColor = '#E0232E'
const primary = `inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors duration-200 hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/35 disabled:shadow-none ${focusClass}`

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
      {children}
    </p>
  )
}

export function RequestSenderPage() {
  useDocumentTitle('Request sender ID')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const identity = getIdentity(user)
  const records = useSenderIds()
  const names = records.map((item) => item.name)
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [sample, setSample] = useState('')
  const [attempted, setAttempted] = useState(false)

  const nameError = senderIdError(name, names)
  const purposeError = purpose.trim().length < 8 ? 'Say what this sender ID will be used for.' : ''
  const sampleError = sample.trim().length < 8 ? 'Add a sample of the SMS you will send.' : ''
  const nameMessage = name ? nameError : attempted ? nameError : ''

  function submit(event) {
    event.preventDefault()
    setAttempted(true)
    if (nameError || purposeError || sampleError) return

    dispatch(
      senderIdRequested({
        id: crypto.randomUUID(),
        name: name.toUpperCase(),
        purpose: purpose.trim(),
        sample: sample.trim(),
        status: 'pending',
        reason: '',
        requestedAt: new Date().toISOString(),
      }),
    )
    navigate(paths.senderIds)
  }

  return (
    <div className="w-full">
      <header>
        <p className="text-sm font-medium text-ink/55">
          <Link
            to={paths.senderIds}
            className={`inline-flex items-center gap-1 rounded-sm text-blue ${focusClass}`}
          >
            <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
            Sender IDs
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">Request sender ID</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60">
          Filed for {identity.name}. The request stays pending until the networks approve it.
        </p>
      </header>

      <form noValidate onSubmit={submit} className="mt-6 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6">
        <div id="sender-name">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label htmlFor="sender-name-input" className="text-sm font-medium text-navy">
              Sender ID
            </label>
            <p className={`text-xs font-semibold tabular-nums ${name.length > senderIdMax ? 'text-[#E0232E]' : 'text-ink/55'}`}>
              {name.length} / {senderIdMax}
            </p>
          </div>
          <input
            id="sender-name-input"
            name="name"
            value={name}
            maxLength={senderIdMax + 8}
            autoCapitalize="characters"
            spellCheck="false"
            aria-invalid={nameMessage ? true : undefined}
            aria-describedby="sender-name-help sender-name-error"
            onChange={(event) => setName(event.target.value.toUpperCase())}
            placeholder="MENSAH MKT"
            className={`${field} h-12 font-mono tracking-wide uppercase`}
          />
          <p id="sender-name-help" className="mt-1.5 text-xs leading-5 text-ink/55">
            Letters, numbers, spaces, hyphens, and underscores. 11 characters including spaces. Start with a letter.
          </p>
          <FieldError id="sender-name-error">{nameMessage}</FieldError>
        </div>

        <div id="sender-purpose" className="mt-4">
          <label htmlFor="sender-purpose-input" className={labelClass}>
            What it is for
          </label>
          <textarea
            id="sender-purpose-input"
            name="purpose"
            rows={3}
            value={purpose}
            aria-invalid={attempted && purposeError ? true : undefined}
            aria-describedby={attempted && purposeError ? 'sender-purpose-error' : undefined}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="Receipts and Saturday opening reminders for Mensah Market."
            className={`${field} py-3`}
          />
          <FieldError id="sender-purpose-error">{attempted ? purposeError : ''}</FieldError>
        </div>

        <div id="sender-sample" className="mt-2">
          <label htmlFor="sender-sample-input" className={labelClass}>
            Sample SMS
          </label>
          <textarea
            id="sender-sample-input"
            name="sample"
            rows={4}
            value={sample}
            aria-invalid={attempted && sampleError ? true : undefined}
            aria-describedby={attempted && sampleError ? 'sender-sample-error' : undefined}
            onChange={(event) => setSample(event.target.value)}
            placeholder="Hi Ama, Mensah Market is open Saturday. Reply YES for a reminder."
            className={`${field} py-3`}
          />
          <FieldError id="sender-sample-error">{attempted ? sampleError : ''}</FieldError>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
          <Link to={paths.senderIds} className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}>
            <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
            Back
          </Link>
          <button type="submit" disabled={Boolean(nameError)} className={primary}>
            <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
            Request sender ID
          </button>
        </div>
      </form>
    </div>
  )
}
