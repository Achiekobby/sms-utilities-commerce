import { useState } from 'react'

export function ServiceArtwork({ service, framed = true }) {
  const [failed, setFailed] = useState(false)
  const Icon = service.icon
  const showImage = Boolean(service.artwork) && !failed

  return (
    <span
      className={`relative block overflow-hidden ${framed ? 'aspect-[16/10] sm:aspect-[16/9]' : 'aspect-[16/8]'}`}
      style={{ backgroundColor: service.tint || '#F4F7FB' }}
    >
      {showImage ? (
        <img
          src={service.artwork}
          alt=""
          width={640}
          height={360}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 size-full object-contain object-center transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.035] ${
            service.open === false ? 'grayscale-[0.35] opacity-80' : ''
          }`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center" style={{ color: service.accent }}>
          <Icon size={36} strokeWidth={1.7} aria-hidden="true" />
        </span>
      )}
    </span>
  )
}

export function ServiceLogo({ service, size = 'md' }) {
  const Icon = service.icon
  const frame =
    size === 'lg' ? 'size-16 rounded-2xl' : size === 'sm' ? 'size-10 rounded-xl' : 'size-12 rounded-xl'
  const iconSize = size === 'lg' ? 28 : size === 'sm' ? 18 : 22

  return (
    <span
      className={`flex shrink-0 items-center justify-center ring-1 ring-black/[0.04] ${frame}`}
      style={{ backgroundColor: service.tint, color: service.accent }}
      aria-hidden="true"
    >
      <Icon size={iconSize} strokeWidth={1.9} />
    </span>
  )
}
