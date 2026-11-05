export function ModulePage({ title, summary }) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-navy">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-ink/60">{summary}</p>
    </div>
  )
}
