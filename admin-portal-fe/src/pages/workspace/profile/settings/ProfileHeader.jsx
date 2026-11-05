import { useId, useState } from 'react'
import { adminFromProfile, adminName } from '../../../../features/auth/session'
import { statusLabel } from '../profileForm'
import { cardClass, focusClass } from './ui'

const photoTypes = ['image/jpeg', 'image/png', 'image/webp']

function initials(profile) {
  const letters = `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase()
  return letters || 'A'
}

function Avatar({ src, letters }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <span className="relative block size-20 shrink-0 overflow-hidden rounded-full bg-navy ring-4 ring-white">
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(true)} />
      </span>
    )
  }

  return (
    <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white">
      {letters}
    </span>
  )
}

export function ProfileHeader({ profile, photo, pendingFile, photoError, onSelect, onClear }) {
  const inputId = useId()
  const active = profile?.status === 'active'

  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar src={photo} letters={initials(profile)} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-navy">{adminName(adminFromProfile(profile))}</h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                active ? 'bg-[#DDF3E6] text-[#0E7A38]' : 'bg-[#F3F6FB] text-navy'
              }`}
            >
              <span aria-hidden="true" className={`size-1.5 rounded-full ${active ? 'bg-[#0E7A38]' : 'bg-navy'}`} />
              {statusLabel(profile?.status)}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-ink/70">{profile?.email}</p>
          <p className="mt-0.5 text-sm text-ink/55">{profile?.role?.name || 'Admin'}</p>
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
              <button type="button" onClick={onClear} className={`cursor-pointer text-sm font-medium text-ink/60 hover:text-navy ${focusClass}`}>
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
