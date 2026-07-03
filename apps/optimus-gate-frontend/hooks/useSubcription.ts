import { useTableState } from "./useTableState";
import { MOCK_SUBCRIPTION } from "@/lib/subcription_data";
import { SubscriptionStatus } from "@/components/subscription/type";

export function useSubscriptionTable() {
  return useTableState({
    data: MOCK_SUBCRIPTION,
    filterTabs: [
      "active",
      "cancelled",
      "completed",
      "attention",
    ] as SubscriptionStatus[],
    getStatus: (a) => a.status,
    getSearchableText: (a) => a.plan.name,
  });
}
