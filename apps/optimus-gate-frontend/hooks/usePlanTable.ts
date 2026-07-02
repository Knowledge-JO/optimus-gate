import { useTableState } from "./useTableState";
import { MOCK_PLANS } from "@/lib/plan-data";
import { PlanFilterTab } from "@/components/plan/type";

export function usePlanTable() {
  return useTableState({
    data: MOCK_PLANS,
    filterTabs: ["Active", "Archived", "Disabled"] as PlanFilterTab[],
    getStatus: (a) => a.status,
    getSearchableText: (a) => a.name,
  });
}
