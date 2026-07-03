import { cn } from "@/lib/utils";

type Tone = "green" | "blue" | "amber" | "red" | "neutral" | "black";

const toneClass: Record<Tone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
  black: "border-black bg-black text-white",
};

export function StatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
