import { useTableState } from "./useTableState";
import type {
  Subscription,
  SubscriptionStatus,
} from "@/components/subscription/type";

export function useSubscriptionTable(data: Subscription[] = []) {
  return useTableState({
    data,
    filterTabs: [
      "Active",
      "Cancelled",
      "Completed",
      "Attention",
    ] as SubscriptionStatus[],
    getStatus: (a) => a.status,
    getSearchableText: (a) => a.plan.name,
  });
}
