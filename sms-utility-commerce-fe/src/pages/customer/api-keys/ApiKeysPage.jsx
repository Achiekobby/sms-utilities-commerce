import { KeyRound, Loader2, Shield } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { apiErrorMessage } from '../../../features/auth/client'
import { formatApiKeyDay, formatLastUsed, maskedApiKey } from '../../../features/apiKeys/apiKey'
import { useNotify } from '../../../features/notifications/useNotify'
import {
  useCreateApiKeyMutation,
  useGetApiKeyQuery,
  useRegenerateApiKeyMutation,
} from '../../../services/api/apiKeys/apiKeysApi'
import { useAuth } from '../../../utils/hooks/useAuth'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { ApiKeyField } from './sections/ApiKeyField'
import { KeyRevealDialog } from './sections/KeyRevealDialog'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'

function StatusBadge({ status }) {
  const active = status === 'active'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? 'bg-[#E5F6EC] text-green' : 'bg-[#FDECEE] text-[#C21F2D]'
      }`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${active ? 'bg-green' : 'bg-[#C21F2D]'}`} />
      {active ? 'Active' : status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  )
}

function MetaRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-[13px] font-medium text-ink/55">{label}</dt>
      <dd className="text-sm font-semibold text-navy sm:text-right">{children}</dd>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mt-6 space-y-4">
      <span className="sr-only">Loading API key</span>
      <div className={card}>
        <span className="skeleton block h-4 w-24 rounded" />
        <span className="skeleton mt-4 block h-11 w-full rounded-lg" />
        <div className="mt-5 space-y-3 border-t border-ink/10 pt-4">
          <span className="skeleton block h-4 w-40 rounded" />
          <span className="skeleton block h-4 w-48 rounded" />
          <span className="skeleton block h-4 w-36 rounded" />
        </div>
      </div>
      <div className={card}>
        <span className="skeleton block h-4 w-40 rounded" />
        <span className="skeleton mt-3 block h-16 w-full rounded" />
        <span className="skeleton mt-4 block h-10 w-44 rounded-lg" />
      </div>
    </div>
  )
}

export function ApiKeysPage() {
  useDocumentTitle('API Key')
  const notify = useNotify()
  const { user, isBusiness } = useAuth()
  const query = useGetApiKeyQuery()
  const [createKey, createState] = useCreateApiKeyMutation()
  const [regenerate, regenerateState] = useRegenerateApiKeyMutation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [revealedToken, setRevealedToken] = useState('')

  const key = query.data ?? null
  const errorReason = String(query.error?.data?.reason ?? '')
  const missingKey =
    query.isError &&
    (Number(query.error?.status) === 404 ||
      ['not_found', 'api_key_not_found', 'resource_not_found', 'no_api_key'].includes(errorReason))
  const loadFailed = query.isError && !missingKey
  // Only block the first paint. Refetches keep prior content so the page never goes blank.
  const waiting = query.isLoading && !key && !query.isError
  const busy = createState.isLoading || regenerateState.isLoading
  const hasKey = Boolean(key?.token || key?.prefix)
  const actionLabel = hasKey ? 'Regenerate API Key' : 'Generate API Key'
  const showContent = !waiting && !loadFailed

  function createBody() {
    const person = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
    const name = String(isBusiness ? user?.businessName || person : person).trim()
    const body = {
      description: 'API key for authenticating SMS API requests',
    }
    if (name) body.name = name
    return body
  }

  async function confirmAction() {
    if (busy) return
    setActionError('')

    try {
      const result = hasKey ? await regenerate().unwrap() : await createKey(createBody()).unwrap()
      setConfirmOpen(false)
      if (result.token) setRevealedToken(result.token)
      notify.success(result.message)
    } catch (error) {
      setActionError(apiErrorMessage(error))
    }
  }

  function dismissReveal() {
    setRevealedToken('')
  }

  return (
    <div className="w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">API Key</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          Use your API key to authenticate requests from your applications to the SMS API.
        </p>
        <p className="mt-3 inline-flex max-w-2xl items-start gap-2 rounded-xl border border-[#D8E7FA] bg-[#F8FBFF] px-3.5 py-2.5 text-[13px] leading-5 text-ink/65">
          <Shield size={15} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0 text-blue" />
          <span>Keep your API key private. Never expose it in client-side code or public repositories.</span>
        </p>
      </header>

      {waiting ? <PageSkeleton /> : null}

      {!waiting && loadFailed ? (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
          <button
            type="button"
            onClick={query.refetch}
            className={`inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-navy ring-1 ring-[#E0232E]/20 hover:bg-canvas ${focusClass}`}
          >
            Try again
          </button>
        </div>
      ) : null}

      {showContent ? (
        <div className="mt-6 space-y-4">
          {hasKey ? (
            <section aria-labelledby="api-key-card-heading" className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="api-key-card-heading" className="text-base font-bold text-navy">
                    {key.name || 'API Key'}
                  </h2>
                  {key.description ? <p className="mt-1 text-sm leading-5 text-ink/60">{key.description}</p> : null}
                </div>
                <StatusBadge status={key.status} />
              </div>

              <ApiKeyField
                value={key.token || maskedApiKey(key.prefix)}
                allowCopy={Boolean(key.token)}
                hint={
                  key.token
                    ? 'Use the eye to show or hide the key. Copy it only into a secure server-side config.'
                    : 'Only the prefix is available. The full key is not included in this response.'
                }
                className="mt-5"
              />

              <dl className="mt-5 space-y-3 border-t border-ink/10 pt-4">
                {key.prefix ? (
                  <MetaRow label="Prefix">
                    <span className="font-mono">{key.prefix}</span>
                  </MetaRow>
                ) : null}
                <MetaRow label="Status">
                  <StatusBadge status={key.status} />
                </MetaRow>
                <MetaRow label="Created">{formatApiKeyDay(key.createdAt) || '—'}</MetaRow>
                <MetaRow label="Last used">{formatLastUsed(key.lastUsedAt)}</MetaRow>
              </dl>
            </section>
          ) : (
            <section aria-labelledby="api-key-empty-heading" className={`${card} text-center`}>
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#E3EFFD] text-blue">
                <KeyRound size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <h2 id="api-key-empty-heading" className="mt-4 text-base font-bold text-navy">
                No API key yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-ink/60">
                Generate an API key to authenticate your applications. The full token is shown only once, so copy it
                somewhere safe when it appears.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActionError('')
                  setConfirmOpen(true)
                }}
                className={`mt-5 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] ${focusClass}`}
              >
                <KeyRound size={16} strokeWidth={2.2} aria-hidden="true" />
                Generate API Key
              </button>
            </section>
          )}

          {hasKey ? (
            <section
              aria-labelledby="regenerate-heading"
              className="flex flex-col gap-4 rounded-lg border border-ink/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5"
            >
              <div className="min-w-0 max-w-xl">
                <h2 id="regenerate-heading" className="text-[15px] font-semibold text-navy">
                  Regenerate API key
                </h2>
                <p className="mt-1.5 text-[13px] leading-5 text-ink/60">
                  Create a new API key and invalidate the current one. Applications using the existing key will stop
                  authenticating.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setActionError('')
                  setConfirmOpen(true)
                }}
                className={`inline-flex h-9 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#E7B4B8] bg-white px-3.5 text-sm font-semibold text-[#C21F2D] transition-colors hover:bg-[#FDECEE] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${focusClass}`}
              >
                {busy ? 'Regenerating…' : 'Regenerate key'}
              </button>
            </section>
          ) : null}
        </div>
      ) : null}

      {confirmOpen ? (
        <ConfirmDialog
          title={hasKey ? 'Regenerate API key?' : 'Generate API key?'}
          description={
            hasKey ? (
              <>
                <p>
                  Your current API key will be deactivated immediately. Applications using the existing key will stop
                  working until they are updated with the new key.
                </p>
                <p className="mt-2">
                  The new API key will only be shown once, so make sure you copy and store it securely.
                </p>
              </>
            ) : (
              <p>
                A new API key will be created for your account. The full token is shown only once, so make sure you copy
                and store it securely.
              </p>
            )
          }
          confirmLabel={actionLabel}
          busyLabel={hasKey ? 'Regenerating…' : 'Generating…'}
          tone={hasKey ? 'warning' : 'restore'}
          busy={busy}
          error={actionError}
          focusConfirm={false}
          onConfirm={confirmAction}
          onClose={() => {
            if (busy) return
            setConfirmOpen(false)
            setActionError('')
          }}
        />
      ) : null}

      {revealedToken ? <KeyRevealDialog token={revealedToken} onClose={dismissReveal} /> : null}

      {busy && !confirmOpen ? (
        <div className="sr-only" role="status">
          <Loader2 aria-hidden="true" />
          Updating API key
        </div>
      ) : null}
    </div>
  )
}
