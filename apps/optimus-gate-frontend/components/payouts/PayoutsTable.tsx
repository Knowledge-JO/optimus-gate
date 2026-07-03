"use client";

import { Button } from "../ui/button";
import { PayoutsTableGrid } from "./PayoutsTableGrid";
import { PayoutFilterTabs } from "./PayoutFilterTabs";
import { SearchInput } from "@/components/layout/SearchInput";
import { TablePagination } from "@/components/layout/TablePagination";
import { usePayoutsTable } from "@/hooks/usePayoutsTable";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PayoutDetailSheet } from "./PayoutDetailSheet";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PayoutsFilterPopover,
  type PayoutFilters,
} from "./PayoutsFilterPopover";
import { Payout } from "./type";

export function PayoutsTable({ payouts = [] }: { payouts?: Payout[] }) {
  const [filters, setFilters] = useState<PayoutFilters>({});

  const extraFilter = useMemo(() => {
    return (p: Payout) => {
      const matchesAccount =
        !filters.account ||
        `${p.bankName} ${p.accountNumberMasked}` === filters.account;
      const matchesDate =
        !filters.dateRange?.from ||
        (new Date(p.date) >= filters.dateRange.from &&
          (!filters.dateRange.to || new Date(p.date) <= filters.dateRange.to));
      return matchesAccount && matchesDate;
    };
  }, [filters]);

  const accountOptions = useMemo(
    () =>
      Array.from(
          new Set(
          payouts.map((p) => `${p.bankName} ${p.accountNumberMasked}`),
        ),
      ),
    [payouts],
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePayoutId = searchParams.get("payoutId");

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
    clearSelection,
  } = usePayoutsTable(payouts, extraFilter);

  function openPayout(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("payoutId", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function closePayout() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("payoutId");
    const next = params.toString();
    router.push(`${pathname}${next ? `?${next}` : ""}`, { scroll: false });
  }

  function handleRetry() {
    // TODO: real retry mutation once backend exists
    console.log("retrying payouts:", Array.from(selectedIds));
    clearSelection();
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-row justify-center gap-x-3">
          <PayoutFilterTabs
            value={filter}
            onChange={setFilter}
            counts={counts}
          />
          <PayoutsFilterPopover
            filters={filters}
            onChange={setFilters}
            accountOptions={accountOptions}
          />
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleRetry}
            >
              <RotateCcw className="size-3.5" />
              Retry {selectedIds.size} selected
            </Button>
          )}
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="search payouts"
        />
      </div>

      <>
        <PayoutsTableGrid
          rows={pageRows}
          selectedIds={selectedIds}
          allOnPageSelected={allOnPageSelected}
          someOnPageSelected={someOnPageSelected}
          onToggleAll={toggleSelectAllOnPage}
          onToggleRow={toggleRow}
          onRowClick={(payout) => openPayout(payout.payoutId)}
        />

        <TablePagination
          page={page}
          totalPages={totalPages}
          showingCount={pageRows.length}
          totalCount={filtered.length}
          onPageChange={goToPage}
        />

        <PayoutDetailSheet
          payouts={payouts}
          payoutId={activePayoutId}
          open={activePayoutId !== null}
          onOpenChange={(open) => !open && closePayout()}
        />
      </>
    </div>
  );
}
