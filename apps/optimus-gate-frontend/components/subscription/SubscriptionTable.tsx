"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "../layout/SearchInput";
import { StatusFilterTabs } from "./StatusFilterTab";
import { TablePagination } from "../layout/TablePagination";
import { useSubscriptionTable } from "@/hooks/useSubcription";
import { SubscriptionTableGrid } from "./SubscriptionGrip";
import { SubscriptionDetailSheet } from "./SubscriptionDetailSheet";

export default function SubscriptionTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");

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
  } = useSubscriptionTable();

  function openSubscription(id: string) {
    const params = new URLSearchParams(searchParams);
    params.set("subscriptionId", id);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function closeSubscription() {
    const params = new URLSearchParams(searchParams);
    params.delete("subscriptionId");
    router.push(`?${params.toString()}`, { scroll: false });
  }

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

      <SubscriptionTableGrid
        rows={pageRows}
        selectedIds={selectedIds}
        allOnPageSelected={allOnPageSelected}
        someOnPageSelected={someOnPageSelected}
        onToggleRow={toggleRow}
        onRowClick={(row) => openSubscription(row.id)}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        showingCount={pageRows.length}
        totalCount={filtered.length}
        onPageChange={goToPage}
      />

      <SubscriptionDetailSheet
        subscriptionId={subscriptionId}
        open={!!subscriptionId}
        onOpenChange={(open) => {
          if (!open) closeSubscription();
        }}
      />
    </div>
  );
}
