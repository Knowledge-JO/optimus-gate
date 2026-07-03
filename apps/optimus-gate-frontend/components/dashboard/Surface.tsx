import { cn } from "@/lib/utils";

export function Surface({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-lg border border-black/10 bg-white", className)}
    >
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-black/10 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            {title && <h2 className="text-base font-black text-black">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
