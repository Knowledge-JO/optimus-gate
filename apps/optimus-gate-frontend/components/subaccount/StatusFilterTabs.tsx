import {
  FilterTabs,
  type FilterTabConfig,
} from "@/components/layout/FilterTabs";
import type { FilterTab } from "./type";

const subAccountTabs: FilterTabConfig<FilterTab>[] = [
  { value: "All", label: "All" },
  { value: "Verified", label: "Verified", dotColor: "bg-green-500" },
  { value: "Unverified", label: "Unverified", dotColor: "bg-amber-500" },
];

export function StatusFilterTabs({
  value,
  onChange,
  counts,
}: {
  value: FilterTab;
  onChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
}) {
  return (
    <FilterTabs
      tabs={subAccountTabs}
      value={value}
      onChange={onChange}
      counts={counts}
    />
  );
}
