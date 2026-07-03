import { CustomSidebarTrigger } from "@/components/layout/SidebarTrigger";
import { cn } from "@/lib/utils";
import { CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";
import { IoMdNotificationsOutline } from "react-icons/io";
import { TestModeChip } from "./TestModeChip";
import type { AuthUser } from "@/lib/auth/types";

export function Header({ user }: { user: AuthUser }) {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email;

  return (
    <header className="w-full border-b border-black/10 bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <CustomSidebarTrigger className="text-zinc-500 hover:text-black" />

          <div className={cn("relative hidden w-full max-w-[24rem] sm:block")}>
            <CiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <Input
              type="text"
              placeholder="Search references, customers, payouts..."
              className={cn(
                "h-9 rounded-lg border-black/10 bg-white pl-9 pr-12 text-sm text-zinc-700 placeholder:text-zinc-400 shadow-none",
                "transition-colors",
                "focus-visible:border-black focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-black/10",
              )}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-x-3">
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold text-black">
              {displayName}
            </p>
            <p className="text-[11px] text-zinc-500">
              {user.role}
            </p>
          </div>
          <TestModeChip />
          <button className="flex size-9 items-center justify-center rounded-lg border border-black/10 bg-white text-zinc-500 transition hover:text-black">
            <IoMdNotificationsOutline className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
