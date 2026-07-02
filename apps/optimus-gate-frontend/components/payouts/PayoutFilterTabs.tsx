import {
  FilterTabs,
  type FilterTabConfig,
} from "@/components/layout/FilterTabs";
import type { PayoutFilterTab } from "./type";

const payoutTabs: FilterTabConfig<PayoutFilterTab>[] = [
  { value: "All", label: "All" },
  { value: "completed", label: "Completed", dotColor: "bg-green-500" },
  { value: "pending", label: "Pending", dotColor: "bg-amber-500" },
  { value: "failed", label: "Failed", dotColor: "bg-red-500" },
];

export function PayoutFilterTabs({
  value,
  onChange,
  counts,
}: {
  value: PayoutFilterTab;
  onChange: (tab: PayoutFilterTab) => void;
  counts: Record<PayoutFilterTab, number>;
}) {
  return (
    <FilterTabs
      tabs={payoutTabs}
      value={value}
      onChange={onChange}
      counts={counts}
    />
  );
}
