export function AuthCardSkeleton() {
  return (
    <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm sm:p-8">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </div>
        <div className="space-y-4">
          <div className="h-11 rounded-lg bg-slate-200" />
          <div className="h-11 rounded-lg bg-slate-200" />
          <div className="h-9 rounded-lg bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
