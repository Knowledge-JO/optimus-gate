import { DataTable } from "@/components/layout/DataTable";
import { subscriptionColumns } from "./SubscriptionColumns";
import { Subscription } from "./type";

export function SubscriptionTableGrid({
  rows,
  selectedIds,
  allOnPageSelected,
  someOnPageSelected,
  onToggleRow,
  onRowClick,
}: {
  rows: Subscription[];
  selectedIds: Set<string>;
  allOnPageSelected: boolean;
  someOnPageSelected: boolean;
  onToggleRow: (id: string) => void;
  onRowClick?: (subscription: Subscription) => void;
}) {
  return (
    <DataTable
      columns={subscriptionColumns}
      rows={rows}
      selectedIds={selectedIds}
      allOnPageSelected={allOnPageSelected}
      someOnPageSelected={someOnPageSelected}
      onToggleRow={onToggleRow}
      onRowClick={onRowClick}
      showSelection={false}
      isRowSelectable={() => true}
      emptyMessage="No subscriptions yet"
    />
  );
}
