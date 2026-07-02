"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Zap } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionButton } from "./ActionButton";

export function TestModeChip() {
  const router = useRouter();
  const [mode, setMode] = useState<"sandbox" | "live">("sandbox");
  const [open, setOpen] = useState(false);

  if (mode === "live") return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ActionButton className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Sandbox
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </ActionButton>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-4">
        <p className="text-sm font-semibold text-slate-900">
          You're in Sandbox mode
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Changes here don't affect your live account. Data is simulated.
        </p>

        <ActionButton
          onClick={() => {
            setOpen(false);
            router.push("/onboarding");
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Zap className="size-3.5" />
          Switch to live account
        </ActionButton>
      </PopoverContent>
    </Popover>
  );
}
