"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangeInput } from "@/components/layout/DateRangeInput";
import type { DateRange } from "react-day-picker";

export type PayoutFilters = {
  dateRange?: DateRange;
  account?: string;
};

export function PayoutsFilterPopover({
  filters,
  onChange,
}: {
  filters: PayoutFilters;
  onChange: (filters: PayoutFilters) => void;
  accountOptions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PayoutFilters>(filters);

  const activeCount =
    (filters.dateRange?.from ? 1 : 0) + (filters.account ? 1 : 0);

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  function clear() {
    setDraft({});
    onChange({});
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(filters);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="size-3.5" />
          Filter
          {activeCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-navy text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <DateRangeInput
          value={draft.dateRange}
          onChange={(range) => setDraft((d) => ({ ...d, dateRange: range }))}
        />

        <div className="flex items-center justify-between border-t pt-3">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
