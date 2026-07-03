interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className={description ? "space-y-1 pb-10" : ""}>
        <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
        {description && (
          <p className="text-slate-400 text-sm font-extralight">
            {description}
          </p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
