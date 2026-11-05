import { useState } from 'react'
import { useNotify } from '../../../../features/notifications/useNotify'
import { displayDefaults, languages, readDisplay, saveDisplay, timezoneOptions } from './devicePreferences'
import { cardClass, focusClass } from './ui'

const themes = [
  { id: 'system', label: 'System', detail: 'Follow the device appearance.', available: false },
  { id: 'light', label: 'Light', detail: 'The theme this portal uses.', available: true },
  { id: 'dark', label: 'Dark', detail: 'Not available in this app.', available: false },
]

export function PreferenceSettings() {
  const notify = useNotify()
  const [values, setValues] = useState(() => readDisplay())
  const zones = timezoneOptions()

  function update(key, value) {
    const next = { ...values, [key]: value, theme: 'light' }
    setValues(next)
    saveDisplay(next)
    notify.success('Preferences saved on this browser.')
  }

  return (
    <div className="flex flex-col gap-4">
      <section className={cardClass}>
        <h2 className="text-base font-semibold text-navy">Language</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">The portal is shown in English. Your choice is kept on this browser.</p>
        <label htmlFor="pref-language" className="mt-4 mb-1.5 block text-sm font-medium text-navy">
          Language
        </label>
        <select
          id="pref-language"
          value={values.language}
          onChange={(event) => update('language', event.target.value)}
          className={`h-11 w-full max-w-sm rounded-lg border border-ink/15 bg-white px-3 text-sm text-ink ${focusClass}`}
        >
          {languages.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      <section className={cardClass}>
        <h2 className="text-base font-semibold text-navy">Timezone</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">Used when this browser formats dates for you. The default is {displayDefaults.timezone}.</p>
        <label htmlFor="pref-timezone" className="mt-4 mb-1.5 block text-sm font-medium text-navy">
          Timezone
        </label>
        <select
          id="pref-timezone"
          value={values.timezone}
          onChange={(event) => update('timezone', event.target.value)}
          className={`h-11 w-full max-w-sm rounded-lg border border-ink/15 bg-white px-3 text-sm text-ink ${focusClass}`}
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </section>

      <section className={cardClass}>
        <h2 className="text-base font-semibold text-navy">Theme</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">This app uses the light theme.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
          {themes.map((theme) => {
            const selected = values.theme === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!theme.available}
                onClick={() => update('theme', theme.id)}
                className={`rounded-xl border px-3 py-3 text-left ${focusClass} ${
                  selected ? 'border-navy bg-[#F3F6FB]' : 'border-ink/10 bg-white'
                } ${theme.available ? 'cursor-pointer hover:border-navy/40' : 'cursor-not-allowed opacity-60'}`}
              >
                <span className="block text-sm font-semibold text-navy">{theme.label}</span>
                <span className="mt-1 block text-sm leading-5 text-ink/60">{theme.detail}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
