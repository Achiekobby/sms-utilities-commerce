export function PageFrame({ children }) {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-md flex-col justify-center px-6 py-16">
      {children}
    </main>
  )
}
