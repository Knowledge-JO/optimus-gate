"use client";

import Empty from "../layout/Empty";
import { StatusFilterTabs } from "./StatusFilterTabs";
import { SubAccountsTableGrid } from "./SubAccountsTableGrid";
import { TablePagination } from "../layout/TablePagination";
import { useSubAccountsTable } from "@/hooks/useSubAccountsTable";
import { SearchInput } from "@/components/layout/SearchInput";
import { BsWindowX } from "react-icons/bs";

export function SubAccountsTable() {
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
    toggleSelectAllOnPage,
    toggleRow,
  } = useSubAccountsTable();

  const isEmpty = filtered.length === 0;

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <StatusFilterTabs value={filter} onChange={setFilter} counts={counts} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="search sub-accounts"
        />
      </div>

      {isEmpty ? (
        <Empty
          className="f"
          icon={<BsWindowX />}
          title="No subaccounts found"
          description=" Subaccounts let you split money received from a transaction across
       multiple bank accounts automatically."
          action={{
            label: "Sub account",
            onClick: () => {},
          }}
        />
      ) : (
        <>
          <SubAccountsTableGrid
            rows={pageRows}
            selectedIds={selectedIds}
            allOnPageSelected={allOnPageSelected}
            someOnPageSelected={someOnPageSelected}
            onToggleAll={toggleSelectAllOnPage}
            onToggleRow={toggleRow}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            showingCount={pageRows.length}
            totalCount={filtered.length}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  );
}
