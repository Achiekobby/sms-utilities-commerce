export function TelcoLogo({ image, label, color, fit }) {
  if (!image) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F6FB] text-xs font-bold text-navy">
        {String(label ?? '').slice(0, 2).toUpperCase()}
      </span>
    )
  }

  const wide = fit === 'contain'

  return (
    <span
      className={`flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ${wide ? 'w-16' : 'w-11'}`}
      style={wide ? { backgroundColor: color } : undefined}
    >
      <img src={image} alt="" className={wide ? 'h-auto w-full' : 'size-full object-cover'} />
    </span>
  )
}
