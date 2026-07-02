import { MOCK_SUB_ACCOUNTS } from "@/lib/sub-account-data";
import type { SubAccountStatus } from "@/components/subaccount/type";
import { useTableState } from "./useTableState";

export function useSubAccountsTable() {
  return useTableState({
    data: MOCK_SUB_ACCOUNTS,
    filterTabs: ["Verified", "Unverified"] as SubAccountStatus[],
    getStatus: (a) => a.status,
    getSearchableText: (a) => a.name,
  });
}
