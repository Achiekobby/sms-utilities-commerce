export function placeAnchoredMenu(anchor, menu) {
  const rect = anchor.getBoundingClientRect()
  const height = menu.offsetHeight
  const width = menu.offsetWidth
  const gap = 6
  const margin = 8
  const spaceBelow = window.innerHeight - rect.bottom - margin
  const spaceAbove = rect.top - margin
  const fitsBelow = spaceBelow >= height + gap
  const fitsAbove = spaceAbove >= height + gap
  const dropUp = fitsBelow ? false : fitsAbove || spaceAbove > spaceBelow
  const unclampedTop = dropUp ? rect.top - height - gap : rect.bottom + gap
  const top = Math.max(margin, Math.min(unclampedTop, window.innerHeight - height - margin))
  const left = Math.max(margin, Math.min(rect.right - width, window.innerWidth - width - margin))
  menu.style.top = `${top}px`
  menu.style.left = `${left}px`
  menu.style.visibility = 'visible'
}
