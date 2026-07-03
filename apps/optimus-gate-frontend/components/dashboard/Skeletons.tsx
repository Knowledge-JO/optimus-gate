export function MetricsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-lg border border-black/10 bg-white p-4"
        >
          <div className="h-2 w-10 rounded bg-zinc-200" />
          <div className="mt-8 h-3 w-24 rounded bg-zinc-200" />
          <div className="mt-3 h-8 w-32 rounded bg-zinc-300" />
          <div className="mt-3 h-3 w-28 rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}

export function SurfaceSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white">
      <div className="border-b border-black/10 px-4 py-4">
        <div className="h-5 w-36 animate-pulse rounded bg-zinc-300" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="divide-y divide-black/5">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 px-4 py-4">
            <div className="h-4 animate-pulse rounded bg-zinc-300" />
            <div className="h-4 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 animate-pulse rounded bg-zinc-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
