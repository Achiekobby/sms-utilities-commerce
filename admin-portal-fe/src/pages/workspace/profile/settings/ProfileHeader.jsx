import { useId, useState } from 'react'
import { Image, Mail, Shield } from 'lucide-react'
import { adminFromProfile, adminName } from '../../../../features/auth/session'
import Images from '../../../../utils/Images'
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
      <span className="relative block size-20 shrink-0 overflow-hidden rounded-full bg-navy shadow-[0_8px_24px_-12px_rgba(16,33,61,0.55)] ring-4 ring-white sm:size-24">
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(true)} />
      </span>
    )
  }

  return (
    <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white shadow-[0_8px_24px_-12px_rgba(16,33,61,0.55)] ring-4 ring-white sm:size-24">
      {letters}
    </span>
  )
}

export function ProfileHeader({ profile, photo, pendingFile, photoError, onSelect, onClear }) {
  const inputId = useId()
  const active = profile?.status === 'active'

  return (
    <section className={cardClass}>
      <img
        src={Images.profile_header_background}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar src={photo} letters={initials(profile)} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-navy">{adminName(adminFromProfile(profile))}</h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                active ? 'bg-[#E7F8F0] text-green' : 'bg-[#F3F6FB] text-navy'
              }`}
            >
              <span aria-hidden="true" className={`size-1.5 rounded-full ${active ? 'bg-green' : 'bg-navy'}`} />
              {statusLabel(profile?.status)}
            </span>
          </div>
          <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-ink/65">
            <Mail size={15} strokeWidth={1.8} className="shrink-0 text-ink/40" aria-hidden="true" />
            <span className="truncate">{profile?.email}</span>
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink/65">
            <Shield size={15} strokeWidth={1.8} className="shrink-0 text-ink/40" aria-hidden="true" />
            {profile?.role?.name || 'Admin'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <label
              htmlFor={inputId}
              className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#E7F8F0] px-3 text-sm font-semibold text-green hover:bg-[#D7F3E4] ${focusClass}`}
            >
              <Image size={15} strokeWidth={1.8} aria-hidden="true" />
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
              <button type="button" onClick={onClear} className={`cursor-pointer text-sm font-medium text-ink/55 hover:text-navy ${focusClass}`}>
                Remove photo
              </button>
            ) : null}
            {photoError ? (
              <p className="text-sm text-[#9F1C26]" role="alert">
                {photoError}
              </p>
            ) : (
              <p className="text-sm text-ink/40">JPG, PNG, or WebP. Up to 2 MB.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
