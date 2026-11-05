import { useId, useState } from 'react'
import { getIdentity } from '../../../../components/workspace/identity'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const photoTypes = ['image/jpeg', 'image/png', 'image/webp']

function Avatar({ src, initials }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <span className="relative block size-20 shrink-0 overflow-hidden rounded-full bg-navy ring-4 ring-white">
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(true)} />
      </span>
    )
  }

  return (
    <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white ring-4 ring-[#F3F6FB]">
      {initials}
    </span>
  )
}

export function ProfileHeader({ user, isVerified, photo, pendingFile, photoError, onSelect, onClear }) {
  const inputId = useId()
  const identity = getIdentity(user)
  const isBusiness = user?.accountType === 'business'
  const name = isBusiness ? identity.name : identity.person
  const email = user?.email || (String(user?.identifier ?? '').includes('@') ? user.identifier : '')
  const active = user?.status === 'active' || isVerified

  return (
    <section className="rounded-xl border border-ink/[0.08] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar src={photo} initials={identity.initials} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-navy">{name}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF3E6] px-2 py-0.5 text-xs font-semibold text-[#0E7A38]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#0E7A38]" />
              {active ? 'Active' : user?.status || 'Signed in'}
            </span>
          </div>
          {email ? <p className="mt-1 truncate text-sm text-ink/70">{email}</p> : null}
          <p className="mt-0.5 text-sm text-ink/55">{identity.kind}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <label
              htmlFor={inputId}
              className={`inline-flex h-9 cursor-pointer items-center rounded-lg bg-[#F3F6FB] px-3 text-sm font-semibold text-navy hover:bg-[#E7EEF8] ${focusClass}`}
            >
              Change photo
              <input
                id={inputId}
                type="file"
                accept={photoTypes.join(',')}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  event.target.value = ''
                  onSelect(file)
                }}
              />
            </label>
            {pendingFile ? (
              <button
                type="button"
                onClick={onClear}
                className={`cursor-pointer text-sm font-medium text-ink/60 hover:text-navy ${focusClass}`}
              >
                Remove photo
              </button>
            ) : null}
          </div>
          {photoError ? (
            <p className="mt-2 text-sm text-[#9F1C26]" role="alert">
              {photoError}
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink/45">JPG, PNG, or WebP. Up to 2 MB.</p>
          )}
        </div>
      </div>
    </section>
  )
}
