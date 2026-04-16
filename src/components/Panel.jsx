export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  contentClassName = "p-5",
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || description || action) && (
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] leading-5 font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
