import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedItem } from "./AnimatedPage";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  change?: string;
  tone?: "green" | "blue" | "amber" | "red" | "black";
  icon: LucideIcon;
};

const toneClass = {
  green: "bg-[#b9ff66]",
  blue: "bg-[#5b8cff]",
  amber: "bg-[#f5b84b]",
  red: "bg-[#f25f5c]",
  black: "bg-black",
};

export function MetricCard({
  label,
  value,
  change,
  tone = "black",
  icon: Icon,
}: MetricCardProps) {
  const positive = change?.startsWith("+");

  return (
    <AnimatedItem>
      <div className="group h-full rounded-lg border border-black/10 bg-white p-4 transition duration-150 hover:-translate-y-0.5 hover:border-black/30">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("h-1.5 w-10 rounded-full", toneClass[tone])} />
          <div className="flex size-9 items-center justify-center rounded-md border border-black/10 bg-zinc-50">
            <Icon className="size-4 text-black" />
          </div>
        </div>
        <div className="mt-5 space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          <p className="text-2xl font-black tabular-nums text-black">
            {value}
          </p>
          {change && (
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              {positive ? (
                <ArrowUpRight className="size-3 text-emerald-600" />
              ) : (
                <ArrowDownRight className="size-3 text-red-600" />
              )}
              {change}
            </p>
          )}
        </div>
      </div>
    </AnimatedItem>
  );
}
