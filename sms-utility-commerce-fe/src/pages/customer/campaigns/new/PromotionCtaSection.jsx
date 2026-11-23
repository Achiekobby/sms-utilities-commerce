import { Hash, Link2, MessageSquareText, Minus, Phone } from 'lucide-react'
import { bodyContainsLink, bodyHasCtaToken, bodyHasWebLink, ctaTypeMeta } from '../cta'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none transition-all duration-200 placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'
const labelClass = 'mb-2 block text-sm font-medium text-navy'
const errorColor = '#E0232E'

const modes = [
  { id: 'none', title: 'No CTA', detail: 'Send the message as written.', icon: Minus },
  { id: 'message', title: 'Link in the message', detail: 'Paste the address in the SMS.', icon: MessageSquareText },
  { id: 'field', title: 'CTA', detail: 'Add a link, USSD code, or phone number.', icon: Link2 },
]

const ctaChoices = [
  { id: 'link', label: 'Web link', icon: Link2 },
  { id: 'ussd', label: 'USSD code', icon: Hash },
  { id: 'phone', label: 'Phone number', icon: Phone },
]

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
      {children}
    </p>
  )
}

export function PromotionCtaSection({ values, errors, onChange }) {
  const cta = values.cta ?? { placement: 'none', value: '', label: '' }
  const placement = cta.placement || 'none'
  const body = values.body ?? ''
  const linkInBody = bodyHasWebLink(body) || bodyContainsLink(body, cta.value)

  const ctaType = cta.type === 'ussd' || cta.type === 'phone' ? cta.type : 'link'
  const typeMeta = ctaTypeMeta(ctaType)

  function choose(next) {
    onChange('cta', {
      ...cta,
      placement: next,
      enabled: next === 'field',
      type: ctaType,
    })
  }

  function chooseType(type) {
    onChange('cta', {
      ...cta,
      type,
      value: type === ctaType ? cta.value : '',
      enabled: true,
      placement: 'field',
    })
  }

  return (
    <section id="campaign-cta" className="scroll-mt-28 pt-4">
      <h3 className="text-sm font-bold text-navy">CTA</h3>
      <p className="mt-1 max-w-2xl text-[13px] leading-5 text-ink/55">
        Put the link in the message, or use the CTA. A promotion can use one of those, not both.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Where the link goes">
        {modes.map((mode) => {
          const selected = placement === mode.id
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(mode.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${focusClass} ${
                selected ? 'border-blue bg-[#F3F8FE] shadow-[0_0_0_1px_rgba(20,115,230,0.28)]' : 'border-ink/12 bg-white hover:border-blue/40'
              }`}
            >
              <Icon size={16} strokeWidth={2.2} className={selected ? 'text-blue' : 'text-ink/45'} aria-hidden="true" />
              <span className="mt-2 block text-sm font-bold text-navy">{mode.title}</span>
              <span className="mt-1 block text-[12px] leading-4 text-ink/55">{mode.detail}</span>
            </button>
          )
        })}
      </div>

      {placement === 'message' ? (
        <p className="mt-3 rounded-xl bg-[#F7FAFD] px-3.5 py-3 text-[13px] leading-5 text-ink/70">
          Paste the full link where it should appear in the message. The CTA stays empty, so the address is not added again.
        </p>
      ) : null}

      {placement === 'field' ? (
        <div className="mt-4 space-y-4">
          <fieldset>
            <legend className={labelClass}>CTA type</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="CTA type">
              {ctaChoices.map((choice) => {
                const selected = ctaType === choice.id
                const Icon = choice.icon
                return (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseType(choice.id)}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${focusClass} ${
                      selected ? 'border-blue bg-[#F3F8FE] text-navy' : 'border-ink/15 bg-white text-navy hover:border-blue/40'
                    }`}
                  >
                    <Icon size={15} strokeWidth={2.2} aria-hidden="true" className={selected ? 'text-blue' : 'text-ink/45'} />
                    {choice.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div>
            <label htmlFor="cta-value" className={labelClass}>
              {typeMeta?.label || 'CTA'}
            </label>
            <input
              id="cta-value"
              inputMode={typeMeta?.inputMode || 'text'}
              value={cta.value}
              onChange={(event) =>
                onChange('cta', { ...cta, value: event.target.value, enabled: true, placement: 'field', type: ctaType })
              }
              placeholder={typeMeta?.placeholder || ''}
              aria-invalid={Boolean(errors.ctaValue)}
              aria-describedby={errors.ctaValue ? 'cta-value-error' : 'cta-value-hint'}
              className={`${field} h-11`}
            />
            <p id="cta-value-hint" className="mt-1.5 text-[13px] leading-5 text-ink/55">
              {cta.label?.trim()
                ? `Added at the end as “${cta.label.trim()}: ${cta.value.trim() || typeMeta?.placeholder || '…'}”.`
                : ctaType === 'ussd'
                  ? 'Added at the end as “Dial *714*20#”, or with a label as “Label: *714*20#”.'
                  : ctaType === 'phone'
                    ? 'Added at the end as “Call 024…”, or with a label as “Label: 024…”.'
                    : 'Added at the end of the message. An optional label becomes “Label: https://…”.'}
            </p>
            <FieldError id="cta-value-error">{errors.ctaValue}</FieldError>
          </div>
          <div>
            <label htmlFor="cta-label" className={labelClass}>
              Label <span className="font-normal text-ink/45">(optional)</span>
            </label>
            <input
              id="cta-label"
              value={cta.label}
              onChange={(event) =>
                onChange('cta', { ...cta, label: event.target.value, enabled: true, placement: 'field', type: ctaType })
              }
              placeholder={ctaType === 'ussd' ? 'Dial' : ctaType === 'phone' ? 'Call' : 'Open'}
              className={`${field} h-11`}
            />
          </div>
          {ctaType === 'link' && linkInBody ? (
            <p className="text-[13px] leading-5 text-[#9F1C26]">
              The message already contains a link. Remove it to use this field, or switch to “Link in the message”.
            </p>
          ) : null}
        </div>
      ) : null}

      {placement === 'none' && (bodyHasCtaToken(body) || bodyHasWebLink(body)) ? (
        <p className="mt-3 text-[13px] leading-5 text-[#9F1C26]">
          {bodyHasCtaToken(body)
            ? 'Remove {link} and {ctaUrl} from the message.'
            : 'This message includes a link. Choose “Link in the message”, or remove the address.'}
        </p>
      ) : null}
      {placement === 'message' && bodyHasCtaToken(body) ? (
        <p className="mt-3 text-[13px] leading-5 text-[#9F1C26]">
          Remove {'{link}'} and {'{ctaUrl}'}, and paste the real link instead.
        </p>
      ) : null}
    </section>
  )
}
