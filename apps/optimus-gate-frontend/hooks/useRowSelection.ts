import { useState } from "react";

export function useRowSelection<T extends { id: string }>(rows: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someOnPageSelected = rows.some((r) => selectedIds.has(r.id)) && !allOnPageSelected;

  const onToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onToggleAll = () => {
    setSelectedIds((prev) => {
      if (allOnPageSelected) return new Set();
      const next = new Set(prev);
      rows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  return { selectedIds, allOnPageSelected, someOnPageSelected, onToggleRow, onToggleAll };
}