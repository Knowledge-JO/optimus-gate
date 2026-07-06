"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ReconcileSelectionContextValue = {
  selected: Set<string>;
  toggle: (reference: string) => void;
  selectAll: (references: string[]) => void;
  clear: () => void;
  isSelected: (reference: string) => boolean;
};

const ReconcileSelectionContext =
  createContext<ReconcileSelectionContextValue | null>(null);

export function ReconcileSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((reference: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(reference)) {
        next.delete(reference);
      } else {
        next.add(reference);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((references: string[]) => {
    setSelected((prev) => {
      const allSelected =
        references.length > 0 && references.every((ref) => prev.has(ref));
      return allSelected ? new Set() : new Set(references);
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);
  const isSelected = useCallback(
    (reference: string) => selected.has(reference),
    [selected],
  );

  const value = useMemo(
    () => ({ selected, toggle, selectAll, clear, isSelected }),
    [selected, toggle, selectAll, clear, isSelected],
  );

  return (
    <ReconcileSelectionContext.Provider value={value}>
      {children}
    </ReconcileSelectionContext.Provider>
  );
}

export function useReconcileSelection() {
  const ctx = useContext(ReconcileSelectionContext);
  if (!ctx) {
    throw new Error(
      "useReconcileSelection must be used within a ReconcileSelectionProvider",
    );
  }
  return ctx;
}
