import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { SelectField } from '../../../../components/SelectField'
import { apiErrorMessage, fieldErrors } from '../../../../features/auth/client'
import { genders, ghanaRegions } from '../../../../features/auth/regions'
import { emailPattern } from '../../../../features/auth/validation'
import { localPhone } from '../../../../features/contacts/contact'
import { useCreateContactMutation, useUpdateContactMutation } from '../../../../services/api/contacts/contactRecordsApi'
import { NAME_MAX } from '../upload/rules'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const fieldClass =
  'h-10 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-navy placeholder:text-ink/40 focus-visible:border-blue/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue'

const empty = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  region: '',
  city: '',
  gpsAddress: '',
  address: '',
}

function fromContact(contact) {
  if (!contact) return empty
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    email: contact.email,
    gender: contact.gender,
    dateOfBirth: contact.dateOfBirth,
    region: contact.region,
    city: contact.city,
    gpsAddress: contact.gpsAddress,
    address: contact.address,
  }
}

function localErrors(values) {
  const errors = {}
  if (!localPhone(values.phone)) errors.phone = 'Enter a Ghana mobile number, such as 024 123 4567.'
  if (values.firstName.trim().length > NAME_MAX) errors.firstName = `First name can be at most ${NAME_MAX} characters.`
  if (values.lastName.trim().length > NAME_MAX) errors.lastName = `Last name can be at most ${NAME_MAX} characters.`
  if (values.email.trim() && !emailPattern.test(values.email.trim())) errors.email = 'Enter an email like name@example.com.'
  return errors
}

function TextField({ id, label, required = false, error = '', ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-navy">
        {label}
        {required ? <span className="text-[#D7192A]"> *</span> : null}
      </label>
      <input id={id} aria-invalid={error ? true : undefined} className={fieldClass} {...props} />
      <p role={error ? 'alert' : undefined} className="mt-1 min-h-4 text-[13px] text-[#E0232E]">
        {error}
      </p>
    </div>
  )
}

export function ContactFormDrawer({ groupId, contact = null, onClose, onSaved }) {
  const editing = Boolean(contact)
  const [values, setValues] = useState(() => fromContact(contact))
  const [showErrors, setShowErrors] = useState(false)
  const [server, setServer] = useState({})
  const [formError, setFormError] = useState('')
  const [createContact, createState] = useCreateContactMutation()
  const [updateContact, updateState] = useUpdateContactMutation()
  const busy = createState.isLoading || updateState.isLoading
  const problems = showErrors ? localErrors(values) : {}

  function set(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setServer((current) => ({ ...current, [key]: '' }))
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const next = localErrors(values)
    if (Object.keys(next).length) {
      setShowErrors(true)
      return
    }
    setFormError('')
    setServer({})
    const run = editing ? updateContact : createContact
    try {
      const result = await run({ groupId, contactId: contact?.id, values }).unwrap()
      onSaved(result.message)
    } catch (error) {
      setServer(fieldErrors(error))
      setFormError(apiErrorMessage(error))
    }
  }

  const errorFor = (key) => problems[key] || server[key] || ''
  const regions = values.region && !ghanaRegions.includes(values.region) ? [values.region, ...ghanaRegions] : ghanaRegions
  const genderOptions = values.gender && !genders.some((item) => item.value === values.gender)
    ? [{ value: values.gender, label: values.gender }, ...genders]
    : genders

  return (
    <Drawer label={editing ? 'Edit contact' : 'Add contact'} onClose={onClose} widthClass="w-[min(34rem,calc(100vw-1.5rem))]">
      <form onSubmit={submit} noValidate className="flex h-full min-h-0 flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-navy">{editing ? 'Edit contact' : 'Add a contact'}</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Only the phone number is required.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-x-3 sm:grid-cols-2">
            <TextField id="contact-first" label="First name" maxLength={NAME_MAX} value={values.firstName} error={errorFor('firstName')} onChange={(event) => set('firstName', event.target.value)} />
            <TextField id="contact-last" label="Last name" maxLength={NAME_MAX} value={values.lastName} error={errorFor('lastName')} onChange={(event) => set('lastName', event.target.value)} />
          </div>
          <TextField
            id="contact-phone"
            label="Phone number"
            required
            data-autofocus
            inputMode="tel"
            autoComplete="tel"
            placeholder="024 123 4567"
            value={values.phone}
            error={errorFor('phone')}
            onChange={(event) => set('phone', event.target.value)}
          />
          <TextField id="contact-email" label="Email" type="email" autoComplete="email" value={values.email} error={errorFor('email')} onChange={(event) => set('email', event.target.value)} />
          <div className="grid gap-x-3 sm:grid-cols-2">
            <SelectField id="contact-gender" label="Gender" dense value={values.gender} error={errorFor('gender')} onChange={(event) => set('gender', event.target.value)}>
              <option value="">Select</option>
              {genderOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectField>
            <TextField id="contact-dob" label="Date of birth" type="date" value={values.dateOfBirth} error={errorFor('dateOfBirth')} onChange={(event) => set('dateOfBirth', event.target.value)} />
          </div>
          <div className="grid gap-x-3 sm:grid-cols-2">
            <SelectField id="contact-region" label="Region" dense value={values.region} error={errorFor('region')} onChange={(event) => set('region', event.target.value)}>
              <option value="">Select</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </SelectField>
            <TextField id="contact-city" label="City" value={values.city} error={errorFor('city')} onChange={(event) => set('city', event.target.value)} />
          </div>
          <TextField id="contact-gps" label="GPS address" value={values.gpsAddress} error={errorFor('gpsAddress')} onChange={(event) => set('gpsAddress', event.target.value)} />
          <TextField id="contact-address" label="Address" value={values.address} error={errorFor('address')} onChange={(event) => set('address', event.target.value)} />
          {formError && !Object.values(server).some(Boolean) ? (
            <p role="alert" className="text-sm text-[#C21F2D]">
              {formError}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-ink/10 px-5 py-4">
          <button type="button" onClick={onClose} disabled={busy} className={`h-10 rounded-lg border border-ink/15 px-4 text-sm font-semibold text-navy ${focusClass}`}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`inline-flex h-10 items-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] disabled:opacity-60 ${focusClass}`}>
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {busy ? 'Saving…' : editing ? 'Save contact' : 'Add contact'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
