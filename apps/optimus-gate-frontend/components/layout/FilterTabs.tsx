import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type FilterTabConfig<T extends string> = {
  value: T;
  label: string;
  dotColor?: string;
};

export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  counts,
}: {
  tabs: FilterTabConfig<T>[];
  value: T;
  onChange: (tab: T) => void;
  counts: Record<T, number>;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
      <TabsList variant="line">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-[12.5px]">
            {tab.dotColor && (
              <span className={cn("size-1.5 rounded-full", tab.dotColor)} />
            )}
            {tab.label}
            <span className="text-[11px] text-muted-foreground/70">
              {counts[tab.value]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}