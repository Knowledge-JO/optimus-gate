export default function ReviewStep({ data }: { data?: unknown }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm font-black text-black">Review</p>
      <pre className="mt-3 max-h-72 overflow-auto rounded bg-zinc-50 p-3 text-xs text-zinc-600">
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </div>
  );
}
