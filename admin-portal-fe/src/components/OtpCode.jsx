import { motion, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'

const errorColor = '#E0232E'
const length = 6

export function OtpCode({ onChange, onComplete, error = false, label = 'Verification code' }) {
  const [digits, setDigits] = useState(() => Array(length).fill(''))
  const refs = useRef([])
  const reduce = useReducedMotion()

  function focusBox(index) {
    refs.current[Math.max(0, Math.min(index, length - 1))]?.focus()
  }

  function commit(next) {
    setDigits(next)
    const value = next.join('')
    onChange?.(value)
    if (next.every(Boolean)) onComplete?.(value)
  }

  function fillFrom(start, text) {
    const chars = text.replace(/\D/g, '').slice(0, length - start).split('')
    if (!chars.length) return
    const next = [...digits]
    chars.forEach((char, offset) => {
      next[start + offset] = char
    })
    commit(next)
    focusBox(start + chars.length)
  }

  function onBoxChange(index, event) {
    let raw = event.target.value.replace(/\D/g, '')
    if (!raw) {
      const next = [...digits]
      next[index] = ''
      commit(next)
      return
    }
    if (digits[index] && raw.length === 2) raw = raw[1]
    fillFrom(index, raw)
  }

  function onKeyDown(index, event) {
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

  function boxes(start) {
    return digits.slice(start, start + 3).map((digit, offset) => {
      const index = start + offset
      return (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={index === 0}
          maxLength={2}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={error || undefined}
          value={digit}
          onChange={(event) => onBoxChange(index, event)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => {
            event.preventDefault()
            fillFrom(0, event.clipboardData.getData('text'))
          }}
          onFocus={(event) => event.target.select()}
          style={error ? { borderColor: errorColor } : undefined}
          className={`h-14 w-full min-w-0 rounded-xl border-2 text-center text-xl font-semibold text-navy outline-none transition-all duration-200 focus:border-blue focus:ring-4 focus:ring-blue/15 sm:h-16 sm:text-2xl ${
            digit ? 'border-blue/40 bg-blue/5' : 'border-ink/15 bg-white'
          }`}
        />
      )
    })
  }

  return (
    <motion.div
      role="group"
      aria-label={label}
      className="mx-auto flex w-full max-w-sm items-center gap-3 sm:max-w-md sm:gap-4"
      animate={error && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="grid min-w-0 flex-1 grid-cols-3 gap-2">{boxes(0)}</span>
      <span aria-hidden="true" className="shrink-0 text-2xl leading-none font-medium text-navy/35">
        -
      </span>
      <span className="grid min-w-0 flex-1 grid-cols-3 gap-2">{boxes(3)}</span>
    </motion.div>
  )
}
