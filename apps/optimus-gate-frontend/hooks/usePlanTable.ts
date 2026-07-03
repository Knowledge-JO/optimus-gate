import { useTableState } from "./useTableState";
import type { Plan, PlanFilterTab } from "@/components/plan/type";

export function usePlanTable(data: Plan[] = []) {
  return useTableState({
    data,
    filterTabs: ["Active", "Archived", "Disabled"] as PlanFilterTab[],
    getStatus: (a) => a.status,
    getSearchableText: (a) => a.name,
  });
}
