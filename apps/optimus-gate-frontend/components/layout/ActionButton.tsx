import { Button } from "@/components/ui/button";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface ActionButtonProps extends ButtonProps {
  icon?: IconType;
  iconClassName?: string;
}

export function ActionButton({
  icon: Icon,
  iconClassName,
  className,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={cn(
        "bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-3 py-2 h-9 text-xs font-semibold gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200",
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          data-icon="inline-start"
          className={cn("h-3 w-3", iconClassName)}
        />
      )}
      {children}
    </Button>
  );
}
