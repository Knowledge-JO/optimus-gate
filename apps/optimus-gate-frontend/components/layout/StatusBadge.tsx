import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusConfig = {
  label: string;
  icon: LucideIcon;
  className: string;
};

export function StatusBadge<T extends string>({
  status,
  config,
}: {
  status: T;
  config: Record<T, StatusConfig>;
}) {
  const { label, icon: Icon, className } = config[status];

  return (
    <Badge
      className={cn("gap-1 rounded-full text-[13px] font-medium", className)}
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
