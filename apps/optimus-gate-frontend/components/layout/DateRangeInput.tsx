"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

function formatDate(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function SingleDateInput({
  date,
  onSelect,
  disabled,
}: {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-34 items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-left",
            !date && "text-muted-foreground",
          )}
        >
          <span>{date ? formatDate(date) : "mm/dd/yyyy"}</span>
          <CalendarIcon className="size-3.5 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          disabled={disabled}
          onSelect={(d) => {
            onSelect(d);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateRangeInput({
  value,
  onChange,
}: {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500">Date range</label>
      <div className="flex justify-center items-center gap-x-2 p-2">
        <SingleDateInput
          date={value?.from}
          onSelect={(date) => onChange({ from: date, to: value?.to })}
        />
        <SingleDateInput
          date={value?.to}
          onSelect={(date) => onChange({ from: value?.from, to: date })}
          disabled={(date) => (value?.from ? date < value.from : false)}
        />
      </div>
    </div>
  );
}
