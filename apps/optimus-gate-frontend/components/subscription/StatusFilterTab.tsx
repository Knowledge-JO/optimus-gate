import {
  FilterTabs,
  type FilterTabConfig,
} from "@/components/layout/FilterTabs";
import type { SubscriptionFilterTab } from "./type";

const subscriptionTabs: FilterTabConfig<SubscriptionFilterTab>[] = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active", dotColor: "bg-green-500" },
  { value: "Attention", label: "Attention", dotColor: "bg-amber-500" },
  { value: "Cancelled", label: "Cancelled", dotColor: "bg-gray-400" },
  { value: "Completed", label: "Completed", dotColor: "bg-blue-500" },
];

export function StatusFilterTabs({
  value,
  onChange,
  counts,
}: {
  value: SubscriptionFilterTab;
  onChange: (tab: SubscriptionFilterTab) => void;
  counts: Record<SubscriptionFilterTab, number>;
}) {
  return (
    <FilterTabs
      tabs={subscriptionTabs}
      value={value}
      onChange={onChange}
      counts={counts}
    />
  );
}