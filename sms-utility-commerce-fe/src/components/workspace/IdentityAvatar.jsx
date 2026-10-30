import { useState } from 'react'

const sizes = {
  sm: 'size-8 text-[11px]',
  md: 'size-10 text-sm',
  lg: 'size-11 text-sm',
}

export function IdentityAvatar({ src, initials, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const box = sizes[size]

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className={`${box} shrink-0 rounded-lg object-cover`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`flex ${box} shrink-0 items-center justify-center rounded-lg bg-navy font-semibold tracking-wide text-white`}
    >
      {initials}
    </span>
  )
}
