import { useEffect, useRef, useState } from 'react'
import { useCheckAvailabilityMutation } from '../../services/api/auth/authApi'
import { useDebouncedValue } from '../../utils/hooks/useDebouncedValue'
import { emailPattern, toLocalPhone, toPhoneIdentifier } from './validation'

const IDLE_MS = 450

function samePhone(a, b) {
  const left = toPhoneIdentifier(a) || toLocalPhone(a)
  const right = toPhoneIdentifier(b) || toLocalPhone(b)
  return Boolean(left && right && left === right)
}

function normalizeKey(type, value) {
  const trimmed = String(value ?? '').trim()
  if (type === 'email') return emailPattern.test(trimmed.toLowerCase()) ? trimmed.toLowerCase() : ''
  return toLocalPhone(trimmed) || ''
}

function fallbackTakenMessage(type) {
  return type === 'email' ? 'This email is already registered.' : 'This phone number is already registered.'
}

function fallbackAvailableMessage(type) {
  return type === 'email' ? 'Email is available.' : 'Phone number is available.'
}

function isTakenResult(data) {
  if (!data) return false
  if (data.reason === 'email_taken' || data.reason === 'phone_taken') return true
  return data.exists === true || data.available === false
}

/**
 * Debounced account availability check for signup/profile.
 * Waits for an idle keystroke pause before calling POST /api/client/check_availability.
 *
 * Taken sample: reason email_taken | phone_taken, exists true, available false.
 */
export function useAvailabilityCheck({ type, value, enabled = true, skipValue = '' }) {
  const raw = String(value ?? '')
  const debounced = useDebouncedValue(raw, IDLE_MS)
  const [check] = useCheckAvailabilityMutation()
  const [snapshot, setSnapshot] = useState(null)
  const requestId = useRef(0)

  const liveKey = normalizeKey(type, raw)
  const idleKey = normalizeKey(type, debounced)
  const skip = Boolean(skipValue) && Boolean(liveKey) && (
    type === 'email'
      ? liveKey === String(skipValue).trim().toLowerCase()
      : samePhone(raw, skipValue)
  )
  const settled = raw === debounced
  const shouldCheck = enabled && Boolean(idleKey) && !skip

  useEffect(() => {
    if (!shouldCheck) {
      setSnapshot(null)
      return undefined
    }

    const id = ++requestId.current
    const body = type === 'email' ? { email: idleKey } : { phone_number: idleKey }

    setSnapshot({ key: idleKey, status: 'checking', message: '' })

    check(body)
      .unwrap()
      .then((data) => {
        if (requestId.current !== id) return
        const taken = isTakenResult(data)
        const available = !taken && data?.available === true && data?.exists !== true
        const apiMessage = typeof data?.message === 'string' ? data.message.trim() : ''

        setSnapshot({
          key: idleKey,
          status: taken ? 'taken' : available ? 'available' : 'idle',
          message: taken
            ? apiMessage || fallbackTakenMessage(type)
            : available
              ? apiMessage || fallbackAvailableMessage(type)
              : '',
        })
      })
      .catch(() => {
        if (requestId.current !== id) return
        // Soft-fail: do not block the form on network/validation flukes.
        setSnapshot({ key: idleKey, status: 'idle', message: '' })
      })

    return () => {
      requestId.current += 1
    }
  }, [shouldCheck, idleKey, type, check])

  const matches = Boolean(snapshot && liveKey && snapshot.key === liveKey)
  const pending = Boolean(liveKey) && enabled && !skip && (!settled || !matches || snapshot?.status === 'checking')
  const taken = Boolean(matches && snapshot?.status === 'taken')
  const available = Boolean(matches && snapshot?.status === 'available')
  const message = matches ? snapshot?.message || '' : ''

  return {
    checking: pending,
    available,
    taken,
    blocked: Boolean(liveKey) && enabled && !skip && (pending || taken),
    error: taken ? message || fallbackTakenMessage(type) : '',
    status: available ? message || fallbackAvailableMessage(type) : '',
  }
}
