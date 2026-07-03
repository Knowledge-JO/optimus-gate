import type { Payout, PayoutStatus } from "@/components/payouts/type";
import { useTableState } from "./useTableState";

export function usePayoutsTable(
  data: Payout[] = [],
  extraFilter?: (p: Payout) => boolean,
) {
  return useTableState({
    data,
    filterTabs: ["success", "pending", "failed"] as PayoutStatus[],
    getStatus: (p) => p.status,
    getSearchableText: (p) => p.payoutId,
    isRowSelectable: (p) => p.status === "failed",
    extraFilter,
  });
}
