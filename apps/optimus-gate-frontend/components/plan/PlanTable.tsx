"use client";

import { usePlanTable } from "@/hooks/usePlanTable";
import { SearchInput } from "../layout/SearchInput";
import { StatusFilterTabs } from "./StatusFilterTab";
import { PlansTableGrid } from "./PlanTableGrid";
import { TablePagination } from "../layout/TablePagination";

export default function PlanTable() {
  const {
    counts,
    filtered,
    pageRows,
    filter,
    setFilter,
    query,
    setQuery,
    page,
    totalPages,
    goToPage,
    selectedIds,
    allOnPageSelected,
    someOnPageSelected,
    toggleRow,
  } = usePlanTable();
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <StatusFilterTabs value={filter} onChange={setFilter} counts={counts} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="search plan"
        />
      </div>

      <PlansTableGrid
        rows={pageRows}
        selectedIds={selectedIds}
        allOnPageSelected={allOnPageSelected}
        someOnPageSelected={someOnPageSelected}
        onToggleRow={toggleRow}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        showingCount={pageRows.length}
        totalCount={filtered.length}
        onPageChange={goToPage}
      />
    </div>
  );
}
