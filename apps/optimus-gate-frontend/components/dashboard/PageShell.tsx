import { cn } from "@/lib/utils";
import { AnimatedPage } from "./AnimatedPage";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PageShell({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("p-4 md:p-6", className)}>
      <AnimatedPage>
        <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl font-black tracking-tight text-black md:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600">
              {description}
            </p>
          </div>
          {action}
        </div>
        {children}
      </AnimatedPage>
    </div>
  );
}
