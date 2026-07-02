import { DataTable } from "@/components/layout/DataTable";
import { planColumns } from "./PlanColumns";
import type { Plan } from "./type";

export function PlansTableGrid({
  rows,
  selectedIds,
  allOnPageSelected,
  someOnPageSelected,
  onToggleRow,
  onRowClick,
}: {
  rows: Plan[];
  selectedIds: Set<string>;
  allOnPageSelected: boolean;
  someOnPageSelected: boolean;
  onToggleRow: (id: string) => void;
  onRowClick?: (plan: Plan) => void;
}) {
  return (
    <DataTable
      columns={planColumns}
      rows={rows}
      selectedIds={selectedIds}
      allOnPageSelected={allOnPageSelected}
      someOnPageSelected={someOnPageSelected}
      onToggleRow={onToggleRow}
      onRowClick={onRowClick}
      showSelection={false}
      isRowSelectable={() => true}
      emptyMessage="No plans yet"
    />
  );
}
