function Bone({ className = '' }) {
  return <span aria-hidden="true" className={`skeleton block rounded-md ${className}`} />
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] ${className}`}>
      {children}
    </div>
  )
}

function Field({ wide = false }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <Bone className="h-3.5 w-24" />
      <Bone className="mt-2 h-12 rounded-xl" />
    </div>
  )
}

export function ProfileSkeleton({ isBusiness = false, label = 'Loading your profile' }) {
  return (
    <div className="mt-6 flex w-full flex-col gap-6 xl:flex-row xl:items-start" role="status" aria-live="polite" aria-busy="true">
      <p className="sr-only">{label}</p>
      <div className="w-full shrink-0 xl:w-80">
        <Card>
          <div className="flex items-center gap-3">
            <Bone className="size-14 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Bone className="h-4 w-32" />
              <Bone className="mt-2 h-3.5 w-24" />
            </div>
          </div>
          <div className="mt-5 space-y-3 border-t border-ink/10 pt-5">
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-4/5" />
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-3/5" />
          </div>
          <Bone className="mt-5 h-10 w-full" />
        </Card>
        <Card className="mt-4">
          <Bone className="h-4 w-16" />
          <div className="mt-3 space-y-2.5">
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-4/5" />
          </div>
        </Card>
        <Card className="mt-4">
          <Bone className="h-4 w-12" />
          <div className="mt-3 space-y-2.5">
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-4/5" />
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-3/5" />
            <Bone className="h-3.5 w-4/5" />
          </div>
        </Card>
      </div>

      <Card className="min-w-0 w-full flex-1 sm:p-6">
        <Bone className="h-4 w-28" />
        <Bone className="mt-2 h-3.5 w-64 max-w-full" />
        <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
          <Field wide />
          {isBusiness ? <Field wide /> : (
            <>
              <Field />
              <Field />
              <Field />
              <Field />
            </>
          )}
        </div>
        <div className="mt-6 border-t border-ink/10 pt-6">
          <Bone className="h-4 w-20" />
          <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
            <Field wide />
            <Field wide />
          </div>
        </div>
        <div className="mt-6 border-t border-ink/10 pt-6">
          <Bone className="h-4 w-20" />
          <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
            <Field />
            <Field />
            <Field wide />
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2 border-t border-ink/10 pt-5">
          <Bone className="h-11 w-24 rounded-lg" />
          <Bone className="h-11 w-36 rounded-lg" />
        </div>
      </Card>
    </div>
  )
}
