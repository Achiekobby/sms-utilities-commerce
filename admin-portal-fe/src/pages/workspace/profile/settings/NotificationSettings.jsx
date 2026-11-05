import { useState } from 'react'
import { useNotify } from '../../../../features/notifications/useNotify'
import { ConfirmDialog } from './ConfirmDialog'
import { notificationDefaults, readNotifications, saveNotifications } from './devicePreferences'
import { cardClass, focusClass } from './ui'

const items = [
  { id: 'email', label: 'Email notifications', detail: 'Account mail and messages sent to your email.' },
  { id: 'push', label: 'Push notifications', detail: 'Alerts in this browser when the site is allowed to notify you.' },
  { id: 'product', label: 'Product updates', detail: 'News about features in the admin portal.' },
  { id: 'security', label: 'Security alerts', detail: 'Sign-in codes and unusual activity. Turning this off hides those alerts on this browser only.' },
  { id: 'activity', label: 'Account activity', detail: 'Changes recorded for this admin account.' },
  { id: 'marketing', label: 'Marketing emails', detail: 'Offers and newsletters. These stay off unless you turn them on.' },
]

function Switch({ id, checked, onChange }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${focusClass} ${checked ? 'bg-green' : 'bg-ink/20'}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

export function NotificationSettings() {
  const notify = useNotify()
  const [values, setValues] = useState(() => readNotifications())
  const [confirmSecurity, setConfirmSecurity] = useState(false)

  function commit(next) {
    setValues(next)
    saveNotifications(next)
    notify.success('Notification preferences saved on this browser.')
  }

  function toggle(id) {
    if (id === 'security' && values.security) {
      setConfirmSecurity(true)
      return
    }
    commit({ ...values, [id]: !values[id] })
  }

  return (
    <section className={cardClass}>
      <h2 className="text-base font-semibold text-navy">Notifications</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-ink/60">
        These choices are stored in this browser. They do not change what the server is able to send.
      </p>
      <ul className="mt-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 border-b border-ink/[0.06] py-4 last:border-b-0">
            <div className="min-w-0">
              <label htmlFor={`notify-${item.id}`} className="text-sm font-semibold text-navy">
                {item.label}
              </label>
              <p className="mt-1 text-sm leading-5 text-ink/60">{item.detail}</p>
            </div>
            <Switch id={`notify-${item.id}`} checked={Boolean(values[item.id] ?? notificationDefaults[item.id])} onChange={() => toggle(item.id)} />
          </li>
        ))}
      </ul>
      {confirmSecurity ? (
        <ConfirmDialog
          title="Turn off security alerts on this browser?"
          description="You can miss a sign-in warning here. The server can still send security email."
          confirmLabel="Turn off"
          tone="warning"
          onConfirm={() => {
            commit({ ...values, security: false })
            setConfirmSecurity(false)
          }}
          onClose={() => setConfirmSecurity(false)}
        />
      ) : null}
    </section>
  )
}
