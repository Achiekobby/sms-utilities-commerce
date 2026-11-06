export function ModulePage({ title }) {
  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-ink/45 uppercase">Coming soon</p>
          <h1 className="mt-1 text-[1.75rem] leading-none font-bold tracking-tight text-navy">{title}</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">This part of the admin portal is not available yet.</p>
        </div>
      </header>
    </div>
  )
}
