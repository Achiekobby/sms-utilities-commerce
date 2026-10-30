const errorColor = '#E0232E'

// Labelled input with an optional fixed prefix (for example the +233 country code)
// and a reserved line for the error so the layout does not jump.
export function TextField({ id, label, error, prefix, suffix, hint, dense = false, ...inputProps }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const locked = Boolean(inputProps.readOnly || inputProps.disabled)
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
        className={`flex items-center rounded-xl border transition-all duration-200 ${
          locked
            ? 'border-ink/10 bg-canvas'
            : 'bg-white focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15'
        } ${dense ? 'h-10' : 'h-12'} ${error || locked ? '' : 'border-ink/15'}`}
        style={error ? { borderColor: errorColor } : undefined}
      >
        {prefix ? (
          <span
            className={`flex h-full shrink-0 items-center border-r border-ink/10 pr-3 pl-4 font-medium text-navy ${
              dense ? 'text-sm' : 'text-base'
            }`}
          >
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink/35 ${
            locked ? 'cursor-default text-ink/75' : 'text-ink'
          } ${dense ? 'text-sm' : 'text-base'} ${prefix ? 'rounded-r-xl px-3' : 'rounded-xl px-4'}`}
          {...inputProps}
        />
        {suffix}
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
