export function BrandBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 0);

  return (
    <div className="flex h-24 items-end gap-2">
      {(values.length ? values : [0, 0, 0, 0, 0, 0]).map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex-1 rounded-t-sm bg-black transition-all hover:bg-[#5b8cff]"
          style={{ height: `${max > 0 ? Math.max(12, (value / max) * 100) : 12}%` }}
        />
      ))}
    </div>
  );
}
