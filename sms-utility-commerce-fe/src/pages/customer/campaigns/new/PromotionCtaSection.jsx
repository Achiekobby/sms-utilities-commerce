import { Check, Link2, MessageCircle, Phone } from 'lucide-react'
import { ctaTypes } from '../cta'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none transition-all duration-200 placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'
const labelClass = 'mb-2 block text-sm font-medium text-navy'
const errorColor = '#E0232E'

const typeIcons = {
  link: Link2,
  phone: Phone,
  whatsapp: MessageCircle,
}

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
      {children}
    </p>
  )
}

function Toggle({ checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${focusClass} ${
        checked ? 'bg-green' : 'bg-ink/20'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function PromotionCtaSection({ values, errors, onChange, onInsertIntoMessage }) {
  const cta = values.cta
  const meta = ctaTypes.find((item) => item.id === cta?.type) ?? ctaTypes[0]
  const hasReward = Boolean(values.reward?.enabled)

  function patch(partial) {
    onChange('cta', { ...cta, ...partial })
  }

  return (
    <section id="campaign-cta" className="scroll-mt-28 border-t border-ink/10 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-navy">
            Call to action <span className="font-medium text-ink/45">(optional)</span>
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-ink/55">
            Add a link, phone number, or WhatsApp contact. Recipients can tap it from the SMS
            {hasReward ? ', and it can unlock the reward when applicable' : ''}.
          </p>
        </div>
        <Toggle
          id="cta-enabled"
          checked={Boolean(cta?.enabled)}
          onChange={(enabled) => patch({ enabled, type: cta?.type || 'link' })}
        />
      </div>

      {cta?.enabled ? (
        <div className="mt-4 space-y-4">
          <fieldset>
            <legend className={labelClass}>CTA type</legend>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="CTA type">
              {ctaTypes.map((item) => {
                const Icon = typeIcons[item.id]
                const selected = cta.type === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => patch({ type: item.id })}
                    className={`relative flex flex-col items-start rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-200 ${focusClass} ${
                      selected
                        ? 'border-blue bg-[#F3F8FE] shadow-[0_0_0_1px_rgba(20,115,230,0.35)]'
                        : 'border-ink/12 bg-white hover:border-blue/40 hover:bg-[#F7FAFD]'
                    }`}
                  >
                    {selected ? (
                      <span
                        className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-blue text-white"
                        aria-hidden="true"
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                    <span
                      className={`flex size-8 items-center justify-center rounded-lg ${
                        selected ? 'bg-blue text-white' : 'bg-[#EEF2F7] text-navy'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-sm font-bold text-navy">{item.label}</span>
                    <span className="mt-1 text-[12px] leading-4 text-ink/55">{item.description}</span>
                  </button>
                )
              })}
            </div>
            <FieldError id="cta-type-error">{errors.ctaType}</FieldError>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="cta-value" className={labelClass}>
                {meta.label}
              </label>
              <input
                id="cta-value"
                inputMode={meta.inputMode}
                value={cta.value}
                onChange={(event) => patch({ value: event.target.value })}
                placeholder={meta.placeholder}
                aria-invalid={Boolean(errors.ctaValue)}
                aria-describedby={errors.ctaValue ? 'cta-value-error' : undefined}
                className={`${field} h-11`}
              />
              <FieldError id="cta-value-error">{errors.ctaValue}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cta-label" className={labelClass}>
                Button / prompt text <span className="font-normal text-ink/45">(optional)</span>
              </label>
              <input
                id="cta-label"
                value={cta.label}
                onChange={(event) => patch({ label: event.target.value })}
                placeholder={
                  cta.type === 'phone'
                    ? 'Call us'
                    : cta.type === 'whatsapp'
                      ? 'Chat on WhatsApp'
                      : 'Shop the offer'
                }
                className={`${field} h-11`}
              />
            </div>
          </div>

          {hasReward ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-[#F3FBF6] px-3.5 py-3">
              <input
                type="checkbox"
                checked={Boolean(cta.triggersReward)}
                onChange={(event) => patch({ triggersReward: event.target.checked })}
                className="mt-0.5 size-4 accent-green"
              />
              <span>
                <span className="block text-sm font-semibold text-navy">Trigger reward on CTA use</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-ink/60">
                  Eligible recipients receive the reward when they open this link, call, or WhatsApp chat — not when the SMS is merely delivered.
                </span>
              </span>
            </label>
          ) : (
            <p className="text-[12px] leading-5 text-ink/50">
              If you add a reward later, you can choose whether using this CTA unlocks it.
            </p>
          )}

          {onInsertIntoMessage && cta.value.trim() ? (
            <button
              type="button"
              onClick={onInsertIntoMessage}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue/25 bg-blue/[0.06] px-3 text-sm font-semibold text-blue hover:bg-blue/[0.1] ${focusClass}`}
            >
              Insert CTA into message
            </button>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-ink/50">Off by default. Enable if this promotion should include a tappable destination.</p>
      )}
    </section>
  )
}
