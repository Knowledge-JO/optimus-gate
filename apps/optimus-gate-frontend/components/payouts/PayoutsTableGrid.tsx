import { DataTable } from "@/components/layout/DataTable";
import { payoutColumns } from "./payoutColumns";
import type { Payout } from "./type";

export function PayoutsTableGrid({
  rows,
  selectedIds,
  allOnPageSelected,
  someOnPageSelected,
  onToggleAll,
  onToggleRow,
  onRowClick,
}: {
  rows: Payout[];
  selectedIds: Set<string>;
  allOnPageSelected: boolean;
  someOnPageSelected: boolean;
  onToggleAll: () => void;
  onToggleRow: (id: string) => void;
  onRowClick?: (payout: Payout) => void;
}) {
  return (
    <DataTable
      columns={payoutColumns}
      rows={rows}
      selectedIds={selectedIds}
      allOnPageSelected={allOnPageSelected}
      someOnPageSelected={someOnPageSelected}
      onToggleAll={onToggleAll}
      onToggleRow={onToggleRow}
      onRowClick={onRowClick}
      isRowSelectable={(p) => p.status === "failed"}
      emptyMessage="No payouts yet"
    />
  );
}
