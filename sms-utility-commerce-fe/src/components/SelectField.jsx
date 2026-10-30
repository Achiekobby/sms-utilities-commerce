import { ChevronDown } from 'lucide-react'

const errorColor = '#E0232E'

export function SelectField({ id, label, error, hint, value, onChange, dense = false, children }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label
        htmlFor={id}
        className={`${hint ? 'mb-1' : dense ? 'mb-1.5' : 'mb-2'} block font-medium text-navy ${
          dense ? 'text-[13px]' : 'text-sm'
        }`}
      >
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mb-2 text-xs leading-5 text-ink/55">
          {hint}
        </p>
      ) : null}
      <div
        className={`relative flex items-center rounded-xl border bg-white transition-all duration-200 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15 ${
          dense ? 'h-10' : 'h-12'
        } ${
          error ? '' : 'border-ink/15'
        }`}
        style={error ? { borderColor: errorColor } : undefined}
      >
        <select
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={onChange}
          className={`h-full w-full appearance-none rounded-xl bg-transparent pr-10 pl-4 outline-none ${
            dense ? 'text-sm' : 'text-base'
          } ${
            value ? 'text-ink' : 'text-ink/35'
          }`}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2.2}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink/45"
        />
      </div>
      <p
        id={errorId}
        role="alert"
        className={`mt-1.5 ${dense ? 'min-h-4 text-[13px]' : 'min-h-5 text-sm'}`}
        style={{ color: errorColor }}
      >
        {error}
      </p>
    </div>
  )
}
