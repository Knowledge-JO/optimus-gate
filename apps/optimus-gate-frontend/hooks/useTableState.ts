import { useState, useMemo } from "react";

export function useTableState<T extends { id: string }, F extends string>({
  data,
  filterTabs,
  getStatus,
  getSearchableText,
  isRowSelectable = () => true,
  extraFilter,
  pageSize = 5,
}: {
  data: T[];
  filterTabs: F[];
  getStatus: (item: T) => F;
  getSearchableText: (item: T) => string;
  isRowSelectable?: (item: T) => boolean;
  extraFilter?: (item: T) => boolean;
  pageSize?: number;
}) {
  const [filter, setFilterState] = useState<"All" | F>("All");
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function setFilter(value: "All" | F) {
    setFilterState(value);
    setPage(1);
  }

  function setQuery(value: string) {
    setQueryState(value);
    setPage(1);
  }

  const counts = useMemo(() => {
    const result = { All: data.length } as Record<"All" | F, number>;
    filterTabs.forEach((tab) => {
      result[tab] = data.filter((item) => getStatus(item) === tab).length;
    });
    return result;
  }, [data, filterTabs, getStatus]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const statusMatch = filter === "All" || getStatus(item) === filter;
      const searchMatch = getSearchableText(item)
        .toLowerCase()
        .includes(query.toLowerCase());
      const extraMatch = extraFilter ? extraFilter(item) : true;
      return statusMatch && searchMatch && extraMatch;
    });
  }, [data, filter, query, getStatus, getSearchableText, extraFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const selectableRows = pageRows.filter(isRowSelectable);
  const allOnPageSelected =
    selectableRows.length > 0 &&
    selectableRows.every((r) => selectedIds.has(r.id));
  const someOnPageSelected =
    selectableRows.some((r) => selectedIds.has(r.id)) && !allOnPageSelected;

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  return {
    counts,
    filtered,
    pageRows,
    filter,
    setFilter,
    query,
    setQuery,
    page: safePage,
    totalPages,
    goToPage,
    selectedIds,
    allOnPageSelected,
    someOnPageSelected,
    toggleSelectAllOnPage,
    toggleRow,
    clearSelection,
  };
}
