import { useEffect, useRef, useState } from 'react'
import { getIdentity } from '../../../../components/workspace/identity'
import { displayPhone, signInLabel } from '../profileModel'

function TruncatedValue({ children, className }) {
  const ref = useRef(null)
  const [overflow, setOverflow] = useState(false)
  const [open, setOpen] = useState(false)
  const text = typeof children === 'string' ? children : ''

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setOverflow(el.scrollWidth > el.clientWidth + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])

  return (
    <span
      className="relative block min-w-0"
      onMouseEnter={() => overflow && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => overflow && setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        ref={ref}
        tabIndex={overflow ? 0 : undefined}
        className={`block truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${className ?? ''}`}
      >
        {children}
      </span>
      {open && overflow ? (
        <span
          role="tooltip"
          className="absolute top-full right-0 z-20 mt-1.5 w-max max-w-64 rounded-lg bg-navy px-2.5 py-1.5 text-left text-xs leading-5 font-medium whitespace-normal text-white shadow-[0_12px_28px_-12px_rgba(11,31,91,0.6)]"
        >
          {children}
        </span>
      ) : null}
    </span>
  )
}

function Fact({ label, value, truncate = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs leading-5 text-ink/50">{label}</dt>
      <dd className="min-w-0 text-right text-sm leading-5 font-medium text-navy">
        {truncate ? <TruncatedValue>{value}</TruncatedValue> : value}
      </dd>
    </div>
  )
}

function Avatar({ src, initials, label }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={label}
        className="size-14 shrink-0 rounded-lg object-cover"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-navy text-base font-semibold tracking-wide text-white"
    >
      {initials}
    </span>
  )
}

export function ProfileIdentity({ user, isVerified, photo }) {
  const identity = getIdentity(user)
  const isBusiness = user?.accountType === 'business'
  const title = isBusiness ? identity.name : identity.person

  return (
    <aside>
      <div className="rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)]">
        <div className="flex items-center gap-3">
          <Avatar
            key={photo || user?.profileImage || identity.initials}
            src={photo || user?.profileImage}
            initials={identity.initials}
            label={title}
          />
          <div className="min-w-0">
            <TruncatedValue className="text-base font-semibold text-navy">{title}</TruncatedValue>
            <p className="truncate text-sm text-ink/55">{identity.kind}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-ink/10 pt-5">
          <Fact label="Workspace" value={identity.name} truncate />
          <Fact label="Signs in with" value={signInLabel(user)} />
          <Fact label="Email" value={isVerified ? 'Confirmed' : 'Not confirmed yet'} />
          <Fact
            label="Mobile"
            value={displayPhone(user?.phone || (String(user?.identifier ?? '').includes('@') ? '' : user?.identifier))}
          />
        </dl>

        <p className="mt-5 text-xs leading-5 text-ink/55">
          {isBusiness
            ? 'The business name is the workspace and the name on sender ID requests. The logo is what people see on this account.'
            : 'Your name is on the wallet and on messages you send yourself. Airtime, data, and bills use the mobile number on this account.'}
        </p>
      </div>
    </aside>
  )
}
