import type { SubAccount, SubAccountStatus } from "@/components/subaccount/type";
import { useTableState } from "./useTableState";

export function useSubAccountsTable(data: SubAccount[] = []) {
  return useTableState({
    data,
    filterTabs: ["Verified", "Unverified"] as SubAccountStatus[],
    getStatus: (a) => a.status,
    getSearchableText: (a) => a.name,
  });
}
