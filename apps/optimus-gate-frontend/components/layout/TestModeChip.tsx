"use client";

import { useState } from "react";
import { ArrowRightLeft, ChevronDown, Zap } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionButton } from "./ActionButton";
import { cn } from "@/lib/utils";

type EnvironmentMode = "sandbox" | "live";

export function TestModeChip({
  mode,
  switchUrl,
}: {
  mode: EnvironmentMode;
  switchUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const isSandbox = mode === "sandbox";
  const label = isSandbox ? "Sandbox" : "Live";
  const switchLabel = isSandbox ? "Switch to live" : "Switch to sandbox";
  const description = isSandbox
    ? "Changes here stay in your sandbox environment."
    : "You are working with live production billing.";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ActionButton
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
            isSandbox
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isSandbox ? "bg-amber-500" : "bg-emerald-500",
            )}
          />
          {label}
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </ActionButton>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-4">
        <p className="text-sm font-semibold text-slate-900">
          You&apos;re in {label} mode
        </p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>

        <a
          href={switchUrl}
          onClick={() => setOpen(false)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900"
        >
          {isSandbox ? (
            <Zap className="size-3.5" />
          ) : (
            <ArrowRightLeft className="size-3.5" />
          )}
          {switchLabel}
        </a>
      </PopoverContent>
    </Popover>
  );
}
