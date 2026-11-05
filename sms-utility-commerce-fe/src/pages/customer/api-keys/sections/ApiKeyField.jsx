import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import { maskedApiKey } from '../../../../features/apiKeys/apiKey'
import { useCopyToClipboard } from '../../../../utils/hooks/useCopyToClipboard'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function hiddenMask(value) {
  const length = Math.max(String(value ?? '').length, 36)
  return '•'.repeat(Math.min(length, 48))
}

export function ApiKeyField({
  value,
  label = 'API Key',
  hint = '',
  allowCopy = false,
  defaultVisible = false,
  className = '',
}) {
  const labelId = useId()
  const [visible, setVisible] = useState(defaultVisible)
  const { copied, copy } = useCopyToClipboard()
  const secret = String(value ?? '')
  const display = visible ? secret : hiddenMask(secret)
  const canCopy = allowCopy && Boolean(secret)

  return (
    <div className={className}>
      {label ? (
        <p id={labelId} className="text-[13px] font-medium text-ink/55">
          {label}
        </p>
      ) : null}

      <div
        className={`group flex items-stretch overflow-hidden rounded-xl border border-[#D8E7FA] bg-[#F8FBFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-blue/45 ${label ? 'mt-2' : ''}`}
      >
        <div className="min-w-0 flex-1 overflow-x-auto px-3.5 py-3">
          <code
            aria-labelledby={label ? labelId : undefined}
            className={`block whitespace-nowrap font-mono text-sm tracking-wide text-navy ${visible && allowCopy ? 'select-all' : 'select-none'}`}
          >
            {display}
          </code>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 border-l border-[#D8E7FA] bg-white/70 px-1.5">
          <button
            type="button"
            aria-pressed={visible}
            aria-label={visible ? 'Hide API key' : 'Show API key'}
            onClick={() => setVisible((current) => !current)}
            className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            {visible ? (
              <EyeOff size={16} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <Eye size={16} strokeWidth={2.2} aria-hidden="true" />
            )}
          </button>

          {canCopy ? (
            <button
              type="button"
              aria-label={copied ? 'API key copied' : 'Copy API key'}
              onClick={() => copy(secret)}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
            >
              {copied ? (
                <Check size={16} strokeWidth={2.3} aria-hidden="true" className="text-green" />
              ) : (
                <Copy size={16} strokeWidth={2.2} aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {hint ? <p className="mt-2 text-[12px] leading-5 text-ink/50">{hint}</p> : null}
      {copied ? (
        <p role="status" className="mt-1.5 text-[12px] font-medium text-green">
          Copied to clipboard
        </p>
      ) : null}
    </div>
  )
}

export function MaskedApiKeyField({ prefix, className = '' }) {
  return (
    <ApiKeyField
      value={maskedApiKey(prefix)}
      hint="Only the prefix is shown. The full key cannot be recovered after it was first created."
      allowCopy={false}
      defaultVisible
      className={className}
    />
  )
}
