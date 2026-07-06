import { StatusPill } from "./StatusPill";

export type OperationsColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
};

export function OperationsTable<T extends { id: string }>({
  columns,
  emptyDescription = "No backend records matched this view.",
  emptyTitle = "No records yet",
  onRowClick,
  rows,
}: {
  columns: OperationsColumn<T>[];
  emptyDescription?: string;
  emptyTitle?: string;
  onRowClick?: (row: T) => void;
  rows: T[];
}) {
  return (
    <div className="w-full max-w-full overflow-x-auto">
      <table className="w-full min-w-190 border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/10 bg-[#fbfaf7] text-left">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 ${
                  column.align === "right" ? "text-right" : ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-black/5 transition-colors hover:bg-zinc-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                {...(onRowClick
                  ? {
                      onClick: () => onRowClick(row),
                      onKeyDown: (
                        event: React.KeyboardEvent<HTMLTableRowElement>,
                      ) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      },
                    }
                  : {})}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-4 py-3 text-zinc-700 ${
                      column.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {column.render
                      ? column.render(row)
                      : String(row[column.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <p className="text-sm font-black text-black">{emptyTitle}</p>
                <p className="mt-1 text-sm text-zinc-500">{emptyDescription}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (["active", "paid", "success", "succeeded", "verified"].includes(normalized)) {
    return "green";
  }
  if (["pending", "processing", "open", "attention"].includes(normalized)) {
    return "amber";
  }
  if (["failed", "refunded", "reversed", "revoked", "canceled", "cancelled"].includes(normalized)) {
    return "red";
  }
  if (["scheduled", "settled", "completed"].includes(normalized)) {
    return "blue";
  }
  return "neutral";
}

export function StatusCell({ status }: { status: string }) {
  return <StatusPill tone={statusTone(status)}>{status}</StatusPill>;
}
