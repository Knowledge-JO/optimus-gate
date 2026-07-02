import {
  FilterTabs,
  type FilterTabConfig,
} from "@/components/layout/FilterTabs";
import type { FilterTab } from "./type";

const subAccountTabs: FilterTabConfig<FilterTab>[] = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active", dotColor: "bg-green-500" },
  { value: "Archived", label: "Archived", dotColor: "bg-amber-500" },
  { value: "Disabled", label: "Disabled", dotColor: "bg-red-500" },
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
