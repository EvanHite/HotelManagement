export function Drawer({ open, title, subtitle, onClose, children, footer }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/20">
      <div className="w-full max-w-xl border-l border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button className="btn-ghost shrink-0" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="max-h-[calc(100vh-145px)] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-slate-200 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
