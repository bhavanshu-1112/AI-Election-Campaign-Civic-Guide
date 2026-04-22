/**
 * Skeleton loading UI displayed during route-level suspense.
 * Provides visual feedback while the main page content loads.
 */

export default function Loading() {
  return (
    <main className="min-h-screen pb-20">
      {/* Hero Skeleton */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center space-y-6">
          <div className="inline-flex h-8 w-40 rounded-full bg-muted animate-pulse mx-auto" />
          <div className="h-16 w-full max-w-2xl mx-auto rounded-xl bg-muted animate-pulse" />
          <div className="h-6 w-full max-w-xl mx-auto rounded-lg bg-muted/60 animate-pulse" />
        </div>
      </section>

      {/* Content Skeletons */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-32">
        {/* Voter Journey Skeleton */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border-2 border-muted p-8 space-y-6">
            <div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-full max-w-md rounded bg-muted/60 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
            <div className="h-12 w-full rounded-lg bg-primary/20 animate-pulse" />
          </div>
        </div>

        {/* Two Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl border p-6 space-y-4">
              <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
              <div className="h-3 w-full rounded bg-muted/60 animate-pulse" />
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ))}
        </div>

        {/* Timeline Skeleton */}
        <div className="max-w-5xl mx-auto rounded-xl border p-8 space-y-6">
          <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="min-w-[160px] h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-48 rounded-xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
