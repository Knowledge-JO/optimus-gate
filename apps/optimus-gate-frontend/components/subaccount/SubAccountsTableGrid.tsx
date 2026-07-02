import { DataTable } from "@/components/layout/DataTable";
import { subAccountColumns } from "./SubAccountColumns";
import type { SubAccount } from "./type";

export function SubAccountsTableGrid({
  rows,
  selectedIds,
  allOnPageSelected,
  someOnPageSelected,
  onToggleAll,
  onToggleRow,
}: {
  rows: SubAccount[];
  selectedIds: Set<string>;
  allOnPageSelected: boolean;
  someOnPageSelected: boolean;
  onToggleAll: () => void;
  onToggleRow: (id: string) => void;
}) {
  return (
    <DataTable
      columns={subAccountColumns}
      rows={rows}
      selectedIds={selectedIds}
      allOnPageSelected={allOnPageSelected}
      someOnPageSelected={someOnPageSelected}
      onToggleAll={onToggleAll}
      onToggleRow={onToggleRow}
      emptyMessage="No sub-accounts match your search"
    />
  );
}
