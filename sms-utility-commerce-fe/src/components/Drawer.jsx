import { useEffect, useRef } from 'react'

const sides = {
  // A modal <dialog> defaults to inset-inline: 0, which pins it to the left; the opposite edge must be released.
  left: 'drawer-left right-auto left-0',
  right: 'drawer-right right-0 left-auto',
}

// A native modal <dialog> used as a side drawer: focus is trapped, Escape closes it, the page
// behind is inert, and focus returns to the opener. Mount it only while it is open.
export function Drawer({
  label,
  side = 'right',
  onClose,
  widthClass = 'w-[min(25rem,calc(100vw-1.5rem))]',
  children,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    // A dialog opens on its first focusable element (usually the close button). Let a drawer pick a better one.
    dialog.querySelector('[data-autofocus]')?.focus()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={`${sides[side]} ${widthClass} fixed inset-y-0 m-0 h-dvh max-h-none max-w-none overflow-hidden bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(16,33,61,0.06),0_0_64px_-16px_rgba(11,31,91,0.4)] backdrop:bg-navy/30`}
    >
      {children}
    </dialog>
  )
}
