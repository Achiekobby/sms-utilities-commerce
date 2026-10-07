import { motion, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'

const errorColor = '#E0232E'

// Six single-digit boxes. The first box is focused on mount, typing advances,
// Backspace steps back, arrows move, and pasting (or one-time-code autofill) fills the row.
export function OtpInput({ length = 6, onChange, onComplete, error = false, label }) {
  const [digits, setDigits] = useState(() => Array(length).fill(''))
  const refs = useRef([])
  const reduce = useReducedMotion()

  function focusBox(index) {
    const target = Math.max(0, Math.min(index, length - 1))
    refs.current[target]?.focus()
  }

  function commit(next) {
    setDigits(next)
    onChange?.(next.join(''))
    if (next.every(Boolean)) onComplete?.(next.join(''))
  }

  function fillFrom(start, text) {
    const chars = text.replace(/\D/g, '').slice(0, length - start).split('')
    if (chars.length === 0) return

    const next = [...digits]
    chars.forEach((char, offset) => {
      next[start + offset] = char
    })
    commit(next)
    focusBox(start + chars.length)
  }

  function handleChange(index, event) {
    let raw = event.target.value.replace(/\D/g, '')

    if (!raw) {
      const next = [...digits]
      next[index] = ''
      commit(next)
      return
    }

    // Typing over a filled box yields two characters; the new one is the last.
    if (digits[index] && raw.length === 2) raw = raw[1]
    fillFrom(index, raw)
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      const next = [...digits]
      next[index - 1] = ''
      commit(next)
      focusBox(index - 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  function handlePaste(event) {
    event.preventDefault()
    fillFrom(0, event.clipboardData.getData('text'))
  }

  return (
    <motion.div
      role="group"
      aria-label={label}
      className="flex items-center justify-between gap-2 sm:gap-3"
      animate={error && !reduce ? { x: [0, -9, 9, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={index === 0}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={error || undefined}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          style={error ? { borderColor: errorColor } : undefined}
          className={`h-14 w-full min-w-0 rounded-xl border-2 text-center text-2xl font-semibold text-navy outline-none transition-all duration-200 focus:border-blue focus:ring-4 focus:ring-blue/15 sm:h-16 ${
            digit ? 'border-blue/40 bg-blue/5' : 'border-ink/15 bg-white'
          }`}
        />
      ))}
    </motion.div>
  )
}
