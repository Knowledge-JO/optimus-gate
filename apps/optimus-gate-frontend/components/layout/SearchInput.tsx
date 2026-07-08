import { cn } from "@/lib/utils";
import { CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className={cn("relative w-full max-w-[20rem]")}>
      <CiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 rounded-lg border-black/10 bg-white pl-9 pr-12 text-sm text-zinc-700 placeholder:text-zinc-400 shadow-none",
          "transition-colors",
          "focus-visible:border-black focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-black/10",
        )}
      />
    </div>
  );
}
