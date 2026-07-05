import { cn } from "@/lib/utils";

interface FilterTabsProps {
  tab: "all" | "unread";
  setTab: (tab: "all" | "unread") => void;
}

export function FilterTabs({ tab, setTab }: FilterTabsProps) {
  return (
    <div className="relative z-10 flex items-center justify-end px-4 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-1 rounded-lg bg-black/4 p-1">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium capitalize transition-all",
              tab === t
                ? "bg-white text-black shadow-sm"
                : "text-zinc-500 hover:text-black",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
