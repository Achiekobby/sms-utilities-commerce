function SvgIcon({ size = 20, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function ChatIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5 3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-5 4v-4H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" />
      <rect x="6" y="7.6" width="10" height="1.7" rx="0.85" fill="#fff" />
      <rect x="6" y="11" width="6.5" height="1.7" rx="0.85" fill="#fff" />
    </SvgIcon>
  )
}

export function WalletIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H17v2.5H6.5a.5.5 0 0 0 0 1H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5z" />
      <circle cx="16.5" cy="13.5" r="1.4" fill="#fff" />
    </SvgIcon>
  )
}

export function BarsIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="12" width="4.5" height="9" rx="1.2" />
      <rect x="9.75" y="3" width="4.5" height="18" rx="1.2" />
      <rect x="16.5" y="8" width="4.5" height="13" rx="1.2" />
    </SvgIcon>
  )
}

export function PhoneIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="6" y="2" width="12" height="20" rx="2.8" />
      <rect x="8.2" y="4.6" width="7.6" height="12.6" rx="1.2" fill="#fff" />
      <circle cx="12" cy="19.6" r="0.9" fill="#fff" />
    </SvgIcon>
  )
}

export function TvIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M8 2.8l4 3 4-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2.5" y="6" width="19" height="14" rx="3" />
      <path d="M10.4 9.6v6.8l5.6-3.4z" fill="#fff" />
    </SvgIcon>
  )
}

export function GiftIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 7.5C10 7.5 7.5 6.8 7.5 5c0-1.2 1.1-1.8 2.2-1.8C11.2 3.2 12 5.3 12 7.5zM12 7.5c2 0 4.5-.7 4.5-2.5 0-1.2-1.1-1.8-2.2-1.8C12.8 3.2 12 5.3 12 7.5z" />
      <rect x="2.5" y="7.5" width="19" height="4" rx="1.2" />
      <rect x="3.8" y="11" width="16.4" height="10" rx="2" />
      <rect x="11" y="7.5" width="2" height="13.5" fill="#fff" />
    </SvgIcon>
  )
}

export function WifiIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M2.5 9.2a14 14 0 0 1 19 0M5.6 12.7a9.5 9.5 0 0 1 12.8 0M8.7 16.1a5 5 0 0 1 6.6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="19.6" r="1.8" />
    </SvgIcon>
  )
}

export function DropIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2.5c3.6 4.4 6.5 7.8 6.5 11.6a6.5 6.5 0 0 1-13 0C5.5 10.3 8.4 6.9 12 2.5z" />
      <path
        d="M8.6 14.2a3.5 3.5 0 0 0 2.6 3.2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </SvgIcon>
  )
}

export function PowerIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M13.6 2L5 13.4h6l-1.6 8.6L19 10.2h-6.2L13.6 2z" />
    </SvgIcon>
  )
}

export function AirtimeIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="5" y="1.5" width="14" height="21" rx="3.2" />
      <rect x="7.4" y="4.4" width="9.2" height="13" rx="1.4" fill="#fff" />
      <path
        d="M12 7.2v7.4M8.3 10.9h7.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="20.1" r="1" fill="#fff" />
    </SvgIcon>
  )
}
