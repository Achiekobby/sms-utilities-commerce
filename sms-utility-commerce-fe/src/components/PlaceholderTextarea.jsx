import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'

const TOKEN = /\{[A-Za-z][A-Za-z0-9_]*\}/g

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function highlightBody(value) {
  const text = String(value ?? '')
  if (!text) return ''
  let html = ''
  let cursor = 0
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0
    html += escapeHtml(text.slice(cursor, start))
    html += `<mark class="placeholder-token">${escapeHtml(match[0])}</mark>`
    cursor = start + match[0].length
  }
  html += escapeHtml(text.slice(cursor))
  return html.endsWith('\n') ? `${html}\n` : html
}

/**
 * Textarea that paints {placeholder} tokens as chips while keeping native editing.
 * `className` is shared so padding and font metrics stay aligned.
 */
export const PlaceholderTextarea = forwardRef(function PlaceholderTextarea(
  { value, onChange, className = '', highlight = true, style, ...props },
  ref,
) {
  const fieldRef = useRef(null)
  const mirrorRef = useRef(null)
  const text = String(value ?? '')
  const showMirror = highlight && text.length > 0

  useImperativeHandle(ref, () => fieldRef.current)

  useLayoutEffect(() => {
    const field = fieldRef.current
    const mirror = mirrorRef.current
    if (!field || !mirror || !showMirror) return

    function syncScroll() {
      mirror.scrollTop = field.scrollTop
      mirror.scrollLeft = field.scrollLeft
    }

    syncScroll()
    field.addEventListener('scroll', syncScroll)
    return () => field.removeEventListener('scroll', syncScroll)
  }, [showMirror, text])

  return (
    <div className="placeholder-textarea relative">
      <textarea
        ref={fieldRef}
        value={value}
        onChange={onChange}
        className={className}
        style={{
          ...style,
          ...(showMirror
            ? {
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                caretColor: 'var(--color-navy)',
              }
            : null),
        }}
        {...props}
      />
      {showMirror ? (
        <div
          ref={mirrorRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-10 overflow-hidden whitespace-pre-wrap break-words ${className}`}
          style={{
            color: 'var(--color-ink)',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            boxShadow: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: highlightBody(text) }}
        />
      ) : null}
    </div>
  )
})
