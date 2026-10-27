const errorColor = '#E0232E'

// Labelled input with an optional fixed prefix (for example the +233 country code)
// and a reserved line for the error so the layout does not jump.
export function TextField({ id, label, error, prefix, hint, ...inputProps }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className={`${hint ? 'mb-1' : 'mb-2'} block text-sm font-medium text-navy`}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mb-2 text-xs leading-5 text-ink/55">
          {hint}
        </p>
      ) : null}
      <div
        className={`flex h-12 items-center rounded-xl border bg-white transition-all duration-200 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15 ${
          error ? '' : 'border-ink/15'
        }`}
        style={error ? { borderColor: errorColor } : undefined}
      >
        {prefix ? (
          <span className="flex h-full shrink-0 items-center border-r border-ink/10 pr-3 pl-4 text-base font-medium text-navy">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-full w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink/35 ${
            prefix ? 'rounded-r-xl px-3' : 'rounded-xl px-4'
          }`}
          {...inputProps}
        />
      </div>
      <p id={errorId} role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
        {error}
      </p>
    </div>
  )
}
