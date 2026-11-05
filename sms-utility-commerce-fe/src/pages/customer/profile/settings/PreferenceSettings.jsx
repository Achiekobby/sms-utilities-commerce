import { useState } from 'react'
import { SelectField } from '../../../../components/SelectField'
import { useNotify } from '../../../../features/notifications/useNotify'
import { displayDefaults, languages, readDisplay, saveDisplay, timezoneOptions } from './devicePreferences'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const themes = [
  { id: 'system', label: 'System', detail: 'Follow the device appearance.', available: false },
  { id: 'light', label: 'Light', detail: 'The theme this workspace uses.', available: true },
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
      <section className="rounded-xl border border-ink/[0.08] bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-navy">Language</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">The workspace is shown in English. Your choice is kept on this browser.</p>
        <div className="mt-4 max-w-sm">
          <SelectField id="pref-language" label="Language" value={values.language} onChange={(event) => update('language', event.target.value)}>
            {languages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section className="rounded-xl border border-ink/[0.08] bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-navy">Timezone</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">Used when this browser formats dates for you. The default is {displayDefaults.timezone}.</p>
        <div className="mt-4 max-w-sm">
          <SelectField id="pref-timezone" label="Timezone" value={values.timezone} onChange={(event) => update('timezone', event.target.value)}>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replaceAll('_', ' ')}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section className="rounded-xl border border-ink/[0.08] bg-white p-5 sm:p-6">
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
