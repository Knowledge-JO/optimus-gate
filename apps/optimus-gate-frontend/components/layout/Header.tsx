import { CustomSidebarTrigger } from "@/components/layout/SidebarTrigger";
import { cn } from "@/lib/utils";
import { CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";
import { IoMdNotificationsOutline } from "react-icons/io";
import { TestModeChip } from "./TestModeChip";

export function Header() {
  return (
    <header className="max-w-full w-full bg-white px-4 py-4 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CustomSidebarTrigger className="text-slate-400 hover:text-slate-700" />

          <div className={cn("relative w-full max-w-[20rem]")}>
            <CiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              type="text"
              placeholder="Search anything..."
              className={cn(
                "h-9 rounded-full border-transparent bg-slate-50 pl-9 pr-12 text-sm text-slate-700 placeholder:text-slate-400 shadow-none",
                "transition-colors",
                "focus-visible:border-brand focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand/30",
              )}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-x-2">
          <TestModeChip />
          <IoMdNotificationsOutline className="h-5 w-5 text-slate-400 hover:text-slate-700" />
        </div>
      </div>
    </header>
  );
}
