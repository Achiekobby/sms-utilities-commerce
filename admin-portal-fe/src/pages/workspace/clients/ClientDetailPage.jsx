import { ArrowLeft, BadgeCheck, Building2, Mail, MapPin, Phone, UserRound, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import {
  clientName,
  formatDate,
  formatPhone,
  formatWhen,
  labelize,
  money,
  monthSpan,
  personName,
  valuesFromClient,
} from '../../../features/clients/clientModel'
import { usePermissions } from '../../../features/auth/usePermissions'
import { useNotify } from '../../../features/notifications/useNotify'
import { clientUpdateBody, onboardingErrors } from '../../../features/onboarding/clientOnboarding'
import { paths } from '../../../routes/paths'
import { useGetClientQuery, useUpdateClientMutation, useUpdateClientStatusMutation } from '../../../services/api/clients/clientsApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { ConfirmDialog } from '../profile/settings/ConfirmDialog'
import { ClientActivity } from './ClientActivity'
import { ClientAvatar } from './ClientAvatar'
import { ClientSubscription } from './ClientSubscription'
import { ClientEditForm } from './ClientEditForm'
import { cardClass, focusClass } from './ui'

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5 border-b border-ink/[0.06] py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-sm font-medium break-words text-navy sm:text-right">{value}</dd>
    </div>
  )
}

function Panel({ icon: Icon, title, text, children }) {
  return (
    <section className={cardClass}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F8F0] text-green">
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-navy">{title}</h2>
          {text ? <p className="mt-0.5 text-sm text-ink/55">{text}</p> : null}
        </div>
      </div>
      <dl className="mt-2">{children}</dl>
    </section>
  )
}

function Badge({ children, tone }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    info: 'bg-[#E7F0FF] text-blue',
    neutral: 'bg-white text-navy ring-1 ring-ink/10',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function ClientDetailPage() {
  const access = usePermissions()
  const allowed = access.hasPermission('client.manage')
  const canViewLogs = access.hasPermission('activity_log.view')
  const canViewSubscriptions = access.hasAnyPermission(['subscription.view', 'subscription.assign'])
  const { clientId } = useParams()
  const id = /^\d+$/.test(clientId ?? '') ? clientId : ''
  const { data, isLoading, isFetching, isError, error, refetch } = useGetClientQuery(id, {
    skip: !allowed || !id,
  })
  const [updateClient, { isLoading: saving }] = useUpdateClientMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateClientStatusMutation()
  const notify = useNotify()
  const [editing, setEditing] = useState(false)
  const [editSession, setEditSession] = useState(0)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusError, setStatusError] = useState('')

  if (!allowed) return <AccessDeniedPage />

  const client = data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : null
  const waiting = !client && (isLoading || isFetching) && !isError
  const business = client?.account_type === 'business'
  const name = client ? clientName(client) : 'Client'
  const onboardedBy = personName(client?.onboarding_by)
  const active = client?.status === 'active'
  const nextStatus = active ? 'inactive' : 'active'

  function beginEdit() {
    setErrors({})
    setFormError('')
    setAttempt(0)
    setEditSession((session) => session + 1)
    setEditing(true)
  }

  function clearField(key) {
    setFormError('')
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  async function save(values, found) {
    if (!client) return
    if (Object.keys(found).length) {
      setErrors(found)
      setFormError('')
      setAttempt((count) => count + 1)
      return
    }

    try {
      const result = await updateClient({ id, body: clientUpdateBody(client.account_type, values) }).unwrap()
      setEditing(false)
      setErrors({})
      setFormError('')
      notify.success(result?.message || 'Client updated.')
    } catch (saveError) {
      const parsed = onboardingErrors(saveError)
      setErrors(parsed.fields)
      setFormError(parsed.formError)
      setAttempt((count) => count + 1)
      if (parsed.formError) notify.error(parsed.formError)
    }
  }

  async function confirmStatus() {
    try {
      const result = await updateStatus({ id, status: nextStatus }).unwrap()
      setStatusOpen(false)
      setStatusError('')
      notify.success(result?.message || 'Client status updated.')
    } catch (statusFailure) {
      const message = apiErrorMessage(statusFailure)
      setStatusError(message)
      notify.error(message)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-5xl">
      <Link
        to={paths.clients}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}
      >
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        Clients
      </Link>

      {!id ? (
        <Missing message="This client link is not valid." />
      ) : null}

      {id && isError ? (
        <div className="mt-5 rounded-2xl border border-[#E0232E]/20 bg-white px-4 py-4" role="alert">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
          <button
            type="button"
            onClick={refetch}
            className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
          >
            Try again
          </button>
        </div>
      ) : null}

      {waiting ? <DetailSkeleton /> : null}
      {id && !waiting && !isError && !client ? <Missing message="This client could not be found." /> : null}

      {client ? (
        <div className="profile-in mt-4">
          <header className={cardClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <ClientAvatar client={client} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-navy">{name}</h1>
                  <Badge tone={active ? 'good' : 'wait'}>{labelize(client.status) || 'Unknown'}</Badge>
                  <Badge tone={client.is_verified ? 'good' : 'wait'}>{client.is_verified ? 'Verified' : 'Unverified'}</Badge>
                  <Badge tone={business ? 'neutral' : 'info'}>{business ? 'Business' : 'Individual'}</Badge>
                </div>
                <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-ink/65">
                  <Mail size={15} className="shrink-0 text-ink/35" aria-hidden="true" />
                  <span className="truncate">{client.email}</span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-ink/65">
                  <Phone size={15} className="shrink-0 text-ink/35" aria-hidden="true" />
                  {formatPhone(client.phone_number) || 'No mobile number'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setStatusError('')
                    setStatusOpen(true)
                  }}
                  className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-semibold ${focusClass} ${
                    active ? 'border-[#E0232E]/30 text-[#9F1C26] hover:bg-[#FDECEE]' : 'border-green/30 text-green hover:bg-[#E7F8F0]'
                  }`}
                >
                  {active ? 'Deactivate' : 'Activate'}
                </button>
                {editing ? null : (
                  <button
                    type="button"
                    onClick={beginEdit}
                    className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-navy px-3 text-sm font-semibold text-white hover:bg-[#0a3268] ${focusClass}`}
                  >
                    Edit details
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {editing ? (
              <ClientEditForm
                key={editSession}
                accountType={client.account_type}
                saved={valuesFromClient(client)}
                currentImage={client.profile_image}
                errors={errors}
                formError={formError}
                attempt={attempt}
                saving={saving}
                onClear={clearField}
                onCancel={() => setEditing(false)}
                onSubmit={save}
              />
            ) : (
              <Panel icon={business ? Building2 : UserRound} title="Account" text="How this client is set up on the platform.">
              <Row label="Email" value={client.email} />
              <Row label="Mobile" value={formatPhone(client.phone_number)} />
              {business ? <Row label="Business name" value={client.business_name} /> : null}
              {business ? null : <Row label="Gender" value={labelize(client.gender)} />}
              {business ? null : <Row label="Date of birth" value={formatDate(client.date_of_birth)} />}
              <Row label="Onboarding" value={client.onboarding_type === 'admin' ? 'Onboarded by an admin' : 'Signed up themselves'} />
              <Row label="Onboarded by" value={onboardedBy} />
              <Row label="Verified" value={formatWhen(client.verified_at)} />
              <Row label="Last sign-in" value={formatWhen(client.last_login_at)} />
              </Panel>
            )}

            {editing ? null : (
              <Panel icon={MapPin} title="Location" text="Where this account is based.">
                <Row label="Region" value={client.region} />
                <Row label="City" value={client.city} />
                <Row label="Address" value={client.address} />
              </Panel>
            )}

            <Panel
              icon={Wallet}
              title="Wallet"
              text={client.wallet ? 'Balance available for messaging and utilities.' : 'A wallet is created after the client verifies.'}
            >
              {client.wallet ? (
                <>
                  <Row label="Balance" value={money(client.wallet.balance, client.wallet.currency)} />
                  <Row label="Status" value={labelize(client.wallet.status)} />
                </>
              ) : (
                <Row label="Wallet" value="Not opened" />
              )}
            </Panel>

            {canViewSubscriptions ? (
              <ClientSubscription clientId={id} clientName={name} />
            ) : (
              <Panel
                icon={BadgeCheck}
                title="Subscription"
                text={client.subscription ? 'The plan currently attached to this client.' : 'No plan is attached yet.'}
              >
                {client.subscription ? (
                  <>
                    <Row label="Plan" value={client.subscription.plan_name} />
                    <Row label="Type" value={labelize(client.subscription.type)} />
                    <Row label="Status" value={labelize(client.subscription.status)} />
                    <Row label="Price" value={money(client.subscription.price, 'GHS')} />
                    <Row
                      label="Units"
                      value={
                        client.subscription.units === null || client.subscription.units === undefined
                          ? ''
                          : String(client.subscription.units)
                      }
                    />
                    <Row label="Length" value={monthSpan(client.subscription.duration_in_months)} />
                    <Row label="Starts" value={formatWhen(client.subscription.starts_at)} />
                    <Row label="Ends" value={formatWhen(client.subscription.ends_at)} />
                  </>
                ) : (
                  <Row label="Plan" value="No subscription" />
                )}
              </Panel>
            )}
          </div>
          {canViewLogs ? <ClientActivity clientId={id} /> : null}
          {statusOpen ? (
            <ConfirmDialog
              title={active ? `Deactivate ${name}?` : `Activate ${name}?`}
              description={
                active
                  ? 'They will stay on the platform, but the account will be inactive until you turn it back on.'
                  : 'They will be able to use this account again.'
              }
              confirmLabel={active ? 'Deactivate client' : 'Activate client'}
              tone={active ? 'warning' : 'caution'}
              error={statusError}
              busy={updatingStatus}
              onConfirm={confirmStatus}
              onClose={() => {
                if (updatingStatus) return
                setStatusOpen(false)
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function Missing({ message }) {
  return (
    <div className="mt-5 rounded-2xl border border-ink/[0.06] bg-white px-5 py-6">
      <p className="text-sm font-semibold text-navy">{message}</p>
      <Link to={paths.clients} className={`mt-3 inline-flex text-sm font-semibold text-blue ${focusClass}`}>
        Back to clients
      </Link>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-ink/[0.06] bg-white p-6" aria-hidden="true">
      <div className="flex gap-4">
        <div className="skeleton size-16 rounded-full" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="skeleton h-6 w-48 rounded-md" />
          <div className="skeleton h-4 w-64 rounded-md" />
        </div>
      </div>
    </div>
  )
}
