import { useState } from 'react'
import { clientInitials, clientName } from '../../../features/clients/clientModel'

const sizes = {
  sm: 'size-9 text-xs',
  md: 'size-14 text-base',
  lg: 'size-16 text-lg',
}

export function ClientAvatar({ client, size = 'sm' }) {
  const [failed, setFailed] = useState(false)
  const src = client?.profile_image
  const name = clientName(client)

  if (src && !failed) {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded-full bg-navy ${sizes[size]}`}>
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(true)} />
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-white ${sizes[size]}`}
    >
      {clientInitials(client)}
      <span className="sr-only">{name}</span>
    </span>
  )
}
