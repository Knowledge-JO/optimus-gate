import { MOCK_PAYOUTS } from "@/lib/payout-data";
import type { Payout, PayoutStatus } from "@/components/payouts/type";
import { useTableState } from "./useTableState";

export function usePayoutsTable(extraFilter?: (p: Payout) => boolean) {
  return useTableState({
    data: MOCK_PAYOUTS,
    filterTabs: ["success", "pending", "failed"] as PayoutStatus[],
    getStatus: (p) => p.status,
    getSearchableText: (p) => p.payoutId,
    isRowSelectable: (p) => p.status === "failed",
    extraFilter,
  });
}
